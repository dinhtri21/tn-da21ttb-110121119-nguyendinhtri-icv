using FluentValidation;

namespace iCV.Application.CVs.Commands.Translate
{
    public class TranslateCVCommandValidator : AbstractValidator<TranslateCVCommand>
    {
        public TranslateCVCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("CV ID kh�ng ???c ?? tr?ng");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID kh�ng ???c ?? tr?ng");

            RuleFor(x => x.TargetLanguage)
                .NotEmpty().WithMessage("Ng�n ng? ?�ch kh�ng ???c ?? tr?ng")
                .Must(lang => lang == "vi" || lang == "en")
                .WithMessage("Ng�n ng? ?�ch ph?i l� 'vi' ho?c 'en'");
        }
    }
}