using FluentValidation;

namespace iCV.Application.CVs.Commands.Delete
{
    public class DeleteCVCommandValidator : AbstractValidator<DeleteCVCommand>
    {
        public DeleteCVCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("CV ID is required.");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required.");
        }
    }
}