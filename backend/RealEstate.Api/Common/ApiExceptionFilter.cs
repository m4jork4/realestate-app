using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace RealEstate.Api.Common;

public sealed class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is ApiException ex)
        {
            context.Result = new ObjectResult(new { error = ex.Message })
            {
                StatusCode = ex.StatusCode
            };
            context.ExceptionHandled = true;
        }
    }
}
