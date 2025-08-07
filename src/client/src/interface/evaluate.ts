export interface IEvaluate {
    area: string;        // Khu vực
    score: number;       // Điểm
    description: string; // Mô tả
    suggestion: string | null;   // Gợi ý
    example?: string | null;    // Ví dụ
    correction?: string | null; // Sửa thành
}