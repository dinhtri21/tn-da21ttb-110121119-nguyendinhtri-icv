namespace iCV.Application.Common.DTOs
{
    public class CVEvaluationAreaDto
    {
        public string Area { get; set; } = string.Empty; // Khu vực
        public int Score { get; set; } // Điểm
        public string Description { get; set; } = string.Empty; // Mô tả
        public string Suggestion { get; set; } = string.Empty; // Gợi ý
        public string? Example { get; set; } // Ví dụ
        public string? Correction { get; set; } // Sửa thành
    }
}