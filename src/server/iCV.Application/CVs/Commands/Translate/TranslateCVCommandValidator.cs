using FluentValidation;

namespace iCV.Application.CVs.Commands.Translate
{
    public class TranslateCVCommandValidator : AbstractValidator<TranslateCVCommand>
    {
        public TranslateCVCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("CV ID không ???c ?? tr?ng");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID không ???c ?? tr?ng");

            RuleFor(x => x.TargetLanguage)
                .NotEmpty().WithMessage("Ngôn ng? ?ích không ???c ?? tr?ng")
                .Must(lang => lang == "vi" || lang == "en")
                .WithMessage("Ngôn ng? ?ích ph?i là 'vi' ho?c 'en'");
        }
    }
}