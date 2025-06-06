using System.Text;
using iTextSharp.text;
using iTextSharp.text.pdf;
using OfficeOpenXml;
using Statistics.API.Models;

namespace Statistics.API.Services
{
    public class ExportService : IExportService
    {
        public async Task<byte[]> ExportOverallStatisticsToPdfAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                using var memoryStream = new MemoryStream();
                var document = new Document(PageSize.A4, 50, 50, 50, 50);
                var writer = PdfWriter.GetInstance(document, memoryStream);
                
                document.Open();

                // Title
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(64, 64, 64));
                var title = new Paragraph("📊 Rapport Statistiques Générales", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 20
                };
                document.Add(title);

                // Generation date
                var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(128, 128, 128));
                var date = new Paragraph($"Généré le: {DateTime.Now:dd/MM/yyyy HH:mm}", dateFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 30
                };
                document.Add(date);

                // Overall Statistics
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(0, 0, 0));
                var header = new Paragraph("Vue d'ensemble", headerFont) { SpacingAfter = 10 };
                document.Add(header);

                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
                document.Add(new Paragraph($"• Total des questionnaires: {stats.TotalQuestionnaires}", normalFont));
                document.Add(new Paragraph($"• Total des soumissions: {stats.TotalSubmissions}", normalFont));
                document.Add(new Paragraph($"• Taux de completion: {stats.OverallCompletionRate:F1}%", normalFont));
                document.Add(new Paragraph($"• Formations actives: {stats.FormationStatistics?.Count ?? 0}", normalFont) { SpacingAfter = 20 });

                // Formation Statistics Table
                if (stats.FormationStatistics?.Any() == true)
                {
                    var formHeader = new Paragraph("Statistiques par Formation", headerFont) { SpacingAfter = 10 };
                    document.Add(formHeader);

                    var table = new PdfPTable(4) { WidthPercentage = 100 };
                    table.SetWidths(new float[] { 15f, 45f, 20f, 20f });

                    // Headers
                    var headerCellFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255));
                    table.AddCell(CreateCell("Code", headerCellFont, new BaseColor(64, 64, 64)));
                    table.AddCell(CreateCell("Formation", headerCellFont, new BaseColor(64, 64, 64)));
                    table.AddCell(CreateCell("Soumissions", headerCellFont, new BaseColor(64, 64, 64)));
                    table.AddCell(CreateCell("Note Moyenne", headerCellFont, new BaseColor(64, 64, 64)));

                    // Data rows
                    var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);
                    foreach (var formation in stats.FormationStatistics)
                    {
                        table.AddCell(CreateCell(formation.FormationCode ?? "", cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell(formation.FormationTitle ?? "", cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell(formation.SubmissionCount.ToString(), cellFont, new BaseColor(255, 255, 255)));
                        table.AddCell(CreateCell($"{formation.AverageRating:F1}/5", cellFont, new BaseColor(255, 255, 255)));
                    }

                    document.Add(table);
                }

                document.Close();
                return memoryStream.ToArray();
            });
        }

        public async Task<byte[]> ExportOverallStatisticsToExcelAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                
                // Overview Sheet
                var overviewSheet = package.Workbook.Worksheets.Add("Vue d'ensemble");
                
                // Title and header styling
                overviewSheet.Cells["A1"].Value = "📊 Rapport Statistiques Générales";
                overviewSheet.Cells["A1"].Style.Font.Size = 16;
                overviewSheet.Cells["A1"].Style.Font.Bold = true;
                
                overviewSheet.Cells["A2"].Value = $"Généré le: {DateTime.Now:dd/MM/yyyy HH:mm}";
                overviewSheet.Cells["A2"].Style.Font.Size = 10;
                
                // Overall statistics
                overviewSheet.Cells["A4"].Value = "Métriques Générales";
                overviewSheet.Cells["A4"].Style.Font.Bold = true;
                overviewSheet.Cells["A4"].Style.Font.Size = 14;
                
                overviewSheet.Cells["A5"].Value = "Total des questionnaires";
                overviewSheet.Cells["B5"].Value = stats.TotalQuestionnaires;
                
                overviewSheet.Cells["A6"].Value = "Total des soumissions";
                overviewSheet.Cells["B6"].Value = stats.TotalSubmissions;
                
                overviewSheet.Cells["A7"].Value = "Taux de completion";
                overviewSheet.Cells["B7"].Value = $"{stats.OverallCompletionRate:F1}%";
                
                overviewSheet.Cells["A8"].Value = "Formations actives";
                overviewSheet.Cells["B8"].Value = stats.FormationStatistics?.Count ?? 0;

                // Formation statistics
                if (stats.FormationStatistics?.Any() == true)
                {
                    var formSheet = package.Workbook.Worksheets.Add("Statistiques Formations");
                    
                    // Headers
                    formSheet.Cells["A1"].Value = "Code Formation";
                    formSheet.Cells["B1"].Value = "Nom de la Formation";
                    formSheet.Cells["C1"].Value = "Nombre de Soumissions";
                    formSheet.Cells["D1"].Value = "Note Moyenne";
                    
                    // Header styling
                    using var headerRange = formSheet.Cells["A1:D1"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    
                    // Data
                    for (int i = 0; i < stats.FormationStatistics.Count; i++)
                    {
                        var formation = stats.FormationStatistics[i];
                        var row = i + 2;
                        
                        formSheet.Cells[$"A{row}"].Value = formation.FormationCode;
                        formSheet.Cells[$"B{row}"].Value = formation.FormationTitle;
                        formSheet.Cells[$"C{row}"].Value = formation.SubmissionCount;
                        formSheet.Cells[$"D{row}"].Value = formation.AverageRating;
                    }
                    
                    formSheet.Cells[formSheet.Dimension.Address].AutoFitColumns();
                }

                overviewSheet.Cells[overviewSheet.Dimension.Address].AutoFitColumns();
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportOverallStatisticsToCsvAsync(OverallStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine("Rapport Statistiques Générales");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                // Overall stats
                csv.AppendLine("Métriques,Valeur");
                csv.AppendLine($"Total des questionnaires,{stats.TotalQuestionnaires}");
                csv.AppendLine($"Total des soumissions,{stats.TotalSubmissions}");
                csv.AppendLine($"Taux de completion,{stats.OverallCompletionRate:F1}%");
                csv.AppendLine($"Formations actives,{stats.FormationStatistics?.Count ?? 0}");
                csv.AppendLine();
                
                // Formation statistics
                if (stats.FormationStatistics?.Any() == true)
                {
                    csv.AppendLine("Statistiques par Formation");
                    csv.AppendLine("Code Formation,Nom de la Formation,Nombre de Soumissions,Note Moyenne");
                    
                    foreach (var formation in stats.FormationStatistics)
                    {
                        csv.AppendLine($"{formation.FormationCode},{formation.FormationTitle},{formation.SubmissionCount},{formation.AverageRating:F1}");
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToPdfAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                using var memoryStream = new MemoryStream();
                var document = new Document(PageSize.A4, 50, 50, 50, 50);
                var writer = PdfWriter.GetInstance(document, memoryStream);
                
                document.Open();

                // Title
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(64, 64, 64));
                var title = new Paragraph($"📋 Analyse Détaillée: {stats.Title}", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 20
                };
                document.Add(title);

                // Basic info
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
                document.Add(new Paragraph($"• ID Publication: {stats.PublicationId}", normalFont));
                document.Add(new Paragraph($"• Total soumissions: {stats.TotalSubmissions}", normalFont));
                document.Add(new Paragraph($"• Taux de completion: {stats.CompletionRate:F1}%", normalFont));
                document.Add(new Paragraph($"• Période: {stats.StartDate:dd/MM/yyyy} - {stats.EndDate:dd/MM/yyyy}", normalFont) { SpacingAfter = 20 });

                // Section statistics
                if (stats.SectionStatistics?.Any() == true)
                {
                    var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(0, 0, 0));
                    var sectionHeader = new Paragraph("Statistiques par Section", headerFont) { SpacingAfter = 15 };
                    document.Add(sectionHeader);

                    foreach (var section in stats.SectionStatistics)
                    {
                        var sectionFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(64, 64, 64));
                        document.Add(new Paragraph(section.SectionTitle, sectionFont) { SpacingAfter = 10 });

                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                document.Add(new Paragraph($"Q: {question.QuestionText}", normalFont));
                                document.Add(new Paragraph($"   Type: {question.QuestionType} | Réponses: {question.TotalAnswers}", normalFont));
                                
                                if (question.AverageScore.HasValue)
                                {
                                    document.Add(new Paragraph($"   Score moyen: {question.AverageScore:F2}/5", normalFont));
                                }
                                
                                document.Add(new Paragraph(" ", normalFont)); // Space
                            }
                        }
                        
                        document.Add(new Paragraph(" ", normalFont)); // Section separator
                    }
                }

                document.Close();
                return memoryStream.ToArray();
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToExcelAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                
                // Summary Sheet
                var summarySheet = package.Workbook.Worksheets.Add("Résumé");
                
                summarySheet.Cells["A1"].Value = $"📋 Analyse: {stats.Title}";
                summarySheet.Cells["A1"].Style.Font.Size = 16;
                summarySheet.Cells["A1"].Style.Font.Bold = true;
                
                summarySheet.Cells["A3"].Value = "ID Publication";
                summarySheet.Cells["B3"].Value = stats.PublicationId;
                summarySheet.Cells["A4"].Value = "Total soumissions";
                summarySheet.Cells["B4"].Value = stats.TotalSubmissions;
                summarySheet.Cells["A5"].Value = "Taux de completion";
                summarySheet.Cells["B5"].Value = $"{stats.CompletionRate:F1}%";
                summarySheet.Cells["A6"].Value = "Date début";
                summarySheet.Cells["B6"].Value = stats.StartDate.ToString("dd/MM/yyyy");
                summarySheet.Cells["A7"].Value = "Date fin";
                summarySheet.Cells["B7"].Value = stats.EndDate.ToString("dd/MM/yyyy");

                // Questions Sheet
                if (stats.SectionStatistics?.Any() == true)
                {
                    var questionsSheet = package.Workbook.Worksheets.Add("Questions");
                    
                    // Headers
                    questionsSheet.Cells["A1"].Value = "Section";
                    questionsSheet.Cells["B1"].Value = "Question";
                    questionsSheet.Cells["C1"].Value = "Type";
                    questionsSheet.Cells["D1"].Value = "Total Réponses";
                    questionsSheet.Cells["E1"].Value = "Score Moyen";
                    
                    // Header styling
                    using var headerRange = questionsSheet.Cells["A1:E1"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
                    
                    var row = 2;
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                questionsSheet.Cells[$"A{row}"].Value = section.SectionTitle;
                                questionsSheet.Cells[$"B{row}"].Value = question.QuestionText;
                                questionsSheet.Cells[$"C{row}"].Value = question.QuestionType;
                                questionsSheet.Cells[$"D{row}"].Value = question.TotalAnswers;
                                questionsSheet.Cells[$"E{row}"].Value = question.AverageScore?.ToString("F2") ?? "N/A";
                                row++;
                            }
                        }
                    }
                    
                    questionsSheet.Cells[questionsSheet.Dimension.Address].AutoFitColumns();
                }

                summarySheet.Cells[summarySheet.Dimension.Address].AutoFitColumns();
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportQuestionnaireStatisticsToCsvAsync(QuestionnaireStatisticsDto stats)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine($"Analyse Détaillée: {stats.Title}");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                // Summary
                csv.AppendLine("Résumé");
                csv.AppendLine($"ID Publication,{stats.PublicationId}");
                csv.AppendLine($"Total soumissions,{stats.TotalSubmissions}");
                csv.AppendLine($"Taux de completion,{stats.CompletionRate:F1}%");
                csv.AppendLine($"Date début,{stats.StartDate:dd/MM/yyyy}");
                csv.AppendLine($"Date fin,{stats.EndDate:dd/MM/yyyy}");
                csv.AppendLine();
                
                // Questions
                csv.AppendLine("Questions Détaillées");
                csv.AppendLine("Section,Question,Type,Total Réponses,Score Moyen");
                
                if (stats.SectionStatistics?.Any() == true)
                {
                    foreach (var section in stats.SectionStatistics)
                    {
                        if (section.QuestionStatistics?.Any() == true)
                        {
                            foreach (var question in section.QuestionStatistics)
                            {
                                csv.AppendLine($"{section.SectionTitle},{question.QuestionText},{question.QuestionType},{question.TotalAnswers},{question.AverageScore?.ToString("F2") ?? "N/A"}");
                            }
                        }
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        public async Task<byte[]> ExportSubmissionsToExcelAsync(List<SubmissionExportDto> submissions, string title)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Données Brutes");
                
                sheet.Cells["A1"].Value = $"📊 Données Brutes: {title}";
                sheet.Cells["A1"].Style.Font.Size = 16;
                sheet.Cells["A1"].Style.Font.Bold = true;
                
                if (submissions.Any())
                {
                    // Headers
                    sheet.Cells["A3"].Value = "ID Utilisateur";
                    sheet.Cells["B3"].Value = "Date Soumission";
                    sheet.Cells["C3"].Value = "Section";
                    sheet.Cells["D3"].Value = "Question";
                    sheet.Cells["E3"].Value = "Type";
                    sheet.Cells["F3"].Value = "Réponse Numérique";
                    sheet.Cells["G3"].Value = "Réponse Texte";
                    
                    // Header styling
                    using var headerRange = sheet.Cells["A3:G3"];
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    
                    var row = 4;
                    foreach (var submission in submissions)
                    {
                        foreach (var section in submission.Sections)
                        {
                            foreach (var answer in section.Answers)
                            {
                                sheet.Cells[$"A{row}"].Value = submission.UserId;
                                sheet.Cells[$"B{row}"].Value = submission.SubmittedAt.ToString("dd/MM/yyyy HH:mm");
                                sheet.Cells[$"C{row}"].Value = section.Title;
                                sheet.Cells[$"D{row}"].Value = answer.Wording;
                                sheet.Cells[$"E{row}"].Value = GetQuestionTypeName(answer.Type);
                                sheet.Cells[$"F{row}"].Value = answer.ValueNumber?.ToString() ?? "";
                                sheet.Cells[$"G{row}"].Value = answer.ValueText ?? "";
                                row++;
                            }
                        }
                    }
                    
                    sheet.Cells[sheet.Dimension.Address].AutoFitColumns();
                }
                
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportSubmissionsToCsvAsync(List<SubmissionExportDto> submissions)
        {
            return await Task.Run(() =>
            {
                var csv = new StringBuilder();
                
                csv.AppendLine("Données Brutes des Soumissions");
                csv.AppendLine($"Généré le,{DateTime.Now:dd/MM/yyyy HH:mm}");
                csv.AppendLine();
                
                csv.AppendLine("ID Utilisateur,Date Soumission,Section,Question,Type,Réponse Numérique,Réponse Texte");
                
                foreach (var submission in submissions)
                {
                    foreach (var section in submission.Sections)
                    {
                        foreach (var answer in section.Answers)
                        {
                            csv.AppendLine($"{submission.UserId},{submission.SubmittedAt:dd/MM/yyyy HH:mm},{section.Title},{answer.Wording},{GetQuestionTypeName(answer.Type)},{answer.ValueNumber?.ToString() ?? ""},{answer.ValueText ?? ""}");
                        }
                    }
                }
                
                return Encoding.UTF8.GetBytes(csv.ToString());
            });
        }

        private PdfPCell CreateCell(string text, Font font, BaseColor backgroundColor)
        {
            var cell = new PdfPCell(new Phrase(text, font))
            {
                BackgroundColor = backgroundColor,
                Padding = 8,
                HorizontalAlignment = Element.ALIGN_LEFT
            };
            return cell;
        }

        private string GetQuestionTypeName(int type)
        {
            return type switch
            {
                1 => "Échelle",
                2 => "Oui/Non",
                3 => "Texte",
                _ => "Inconnu"
            };
        }
    }
} 