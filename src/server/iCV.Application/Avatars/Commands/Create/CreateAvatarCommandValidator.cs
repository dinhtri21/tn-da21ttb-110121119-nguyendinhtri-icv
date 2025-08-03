using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Avatars.Commands.Create
{
    public class CreateAvatarCommandValidator : AbstractValidator<CreateAvatarCommand>
    {
        public CreateAvatarCommandValidator() { 
            RuleFor(x => x.File)
                .NotNull()
                .WithMessage("Avatar cannot be null.");
            RuleFor(x => x.FileName)
                .NotEmpty()
                .WithMessage("Avatar file name cannot be empty.");
            RuleFor(x => x.CVId)
                .NotEmpty()
                .WithMessage("CV ID cannot be empty.");
        }
    }
}
