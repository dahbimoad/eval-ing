namespace Questionnaire.Application.DTOs
{
    public class QuestionnaireForProfessionalDto
    {
        public string TemplateCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Version { get; set; }
        public List<SectionDto> Sections { get; set; } = new();
    }

    // Les autres DTOs (SectionDto, QuestionDto, SubmitAnswersRequestDto, AnswerDto) 
    // sont réutilisés depuis les DTOs existants des professeurs
}