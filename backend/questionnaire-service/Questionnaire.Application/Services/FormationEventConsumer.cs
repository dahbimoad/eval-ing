using Confluent.Kafka;
using System.Text.Json;

namespace Questionnaire.Application.Services
{
    public class FormationEventConsumer : BackgroundService
    {
        private readonly IConsumer<string, string> _consumer;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<FormationEventConsumer> _logger;
        private readonly string _topic;

        public FormationEventConsumer(
            IConfiguration configuration,
            IServiceProvider serviceProvider,
            ILogger<FormationEventConsumer> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _topic = configuration["Kafka:Consumer:Topics:FormationEvents"]!;

            var config = new ConsumerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"],
                GroupId = configuration["Kafka:Consumer:GroupId"],
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false,
                SessionTimeoutMs = 6000,
                MaxPollIntervalMs = 300000
            };

            _consumer = new ConsumerBuilder<string, string>(config)
                .SetErrorHandler((_, e) => _logger.LogError("Consumer error: {Error}", e.Reason))
                .Build();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _consumer.Subscribe(_topic);
            _logger.LogInformation("Started consuming messages from topic: {Topic}", _topic);

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = _consumer.Consume(stoppingToken);

                        if (consumeResult?.Message?.Value != null)
                        {
                            await ProcessMessageAsync(consumeResult);
                            _consumer.Commit(consumeResult);
                        }
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogError(ex, "Error consuming message: {Error}", ex.Error.Reason);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Unexpected error in consumer loop");
                        await Task.Delay(1000, stoppingToken); // Brief pause before retrying
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
            }
            finally
            {
                _consumer.Close();
                _logger.LogInformation("Consumer closed");
            }
        }

        private async Task ProcessMessageAsync(ConsumeResult<string, string> consumeResult)
        {
            try
            {
                _logger.LogInformation("Processing message from partition {Partition}, offset {Offset}",
                    consumeResult.Partition, consumeResult.Offset);

                var formationEvent = JsonSerializer.Deserialize<FormationCreatedEvent>(
                    consumeResult.Message.Value,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                if (formationEvent != null && formationEvent.EventType == "FormationCreated")
                {
                    using var scope = _serviceProvider.CreateScope();
                    var formationCacheService = scope.ServiceProvider.GetRequiredService<IFormationCacheService>();

                    await formationCacheService.AddOrUpdateFormationAsync(formationEvent);

                    _logger.LogInformation("Successfully processed formation event for code: {Code}", formationEvent.Code);
                }
                else
                {
                    _logger.LogWarning("Received invalid or unknown event type: {EventType}", formationEvent?.EventType);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize message: {Message}", consumeResult.Message.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process formation event: {Message}", consumeResult.Message.Value);
                throw; // Re-throw to prevent commit
            }
        }

        public override void Dispose()
        {
            _consumer?.Dispose();
            base.Dispose();
        }
    }
}