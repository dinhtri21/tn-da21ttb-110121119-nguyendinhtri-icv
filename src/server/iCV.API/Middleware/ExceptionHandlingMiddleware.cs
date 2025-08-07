
using FluentValidation;
using iCV.Domain.Entities;

namespace WatchStore.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (UnauthorizedAccessException ex)
            {
                await HandleExceptionAsync(context, StatusCodes.Status401Unauthorized, new ErrorResponse
                {
                    isSuccess = false,
                    message = ex.Message,
                    data = null,
                });
            }
            catch (KeyNotFoundException ex)
            {
                await HandleExceptionAsync(context, StatusCodes.Status404NotFound, new ErrorResponse
                {
                    isSuccess = false,
                    message = ex.Message,
                    data = null,
                });
            }
            catch (ValidationException ex)
            {
                await HandleExceptionAsync(context, StatusCodes.Status400BadRequest, new ErrorResponse
                {
                    isSuccess = false,
                    message = ex.Message,
                    data = null,
                });
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    isSuccess = false,
                    message = ex.Message,
                    data = null,
                });
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, int statusCode, ErrorResponse message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var result = System.Text.Json.JsonSerializer.Serialize(message);
            return context.Response.WriteAsync(result);
        }

        public class ErrorResponse
        {
            public bool isSuccess { get; set; }
            public string message { get; set; }
            public object? data { get; set; }
        }
    }
}