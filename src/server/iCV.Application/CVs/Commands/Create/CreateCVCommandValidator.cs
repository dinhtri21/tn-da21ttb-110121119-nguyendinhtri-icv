using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.CVs.Commands.Create
{
    public class CreateCVCommandValidator : AbstractValidator<CreateCVCommand>
    {
        public CreateCVCommandValidator() {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required.");

            RuleFor(x => x.FileName)
                .NotNull().WithMessage("File name is required.");

            RuleFor(x => x.CreateWhen)
                .NotNull().WithMessage("CreateWhen name is required.");

            RuleFor(x => x.Template)
                .NotNull().WithMessage("Template is required.");
        }
    }
}
