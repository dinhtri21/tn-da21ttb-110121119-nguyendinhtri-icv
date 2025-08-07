using FluentValidation;
using iCV.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace iCV.Application.Users.Commands.Create.CreateUserCommand
{
    public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>, IValidatorMarker
    {
        public CreateUserCommandValidator()
        {

            RuleFor(v => v.Name)
                .NotEmpty()
                .WithMessage("Tên là bắt buộc.")
                .MaximumLength(200)
                .WithMessage("Tên không được vượt quá 200 ký tự.");

            RuleFor(v => v.Email)
                .NotEmpty()
                .WithMessage("Email là bắt buộc.")
                .MaximumLength(200)
                .WithMessage("Email không được vượt quá 200 ký tự.")
                .EmailAddress()
                .WithMessage("Email không hợp lệ.");

            RuleFor(v => v.PassWord)
                .NotEmpty()
                .WithMessage("Password là bắt buộc.")
                .MaximumLength(255)
                .WithMessage("Password không được vượt quá 255 ký tự.");
        }
    }
}
