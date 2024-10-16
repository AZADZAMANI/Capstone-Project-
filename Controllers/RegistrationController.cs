using CapStoneProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data.SqlTypes;

namespace CapStoneProject.Controllers
{
    [ApiController]
    [Route("[controller]")]
    
    public class RegistrationController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public RegistrationController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        [HttpPost]
        [Route("registration")]
        public string registration(Registration registration)
        {
            SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("Dbcon").ToString());
            SqlCommand cmd = new SqlCommand("Insert into Users(UserID,FullName,UserEmail,Password) VALUES ('"+registration.UserId+"','"+registration.fullName+"','"+registration.UserEmail+ "','" + registration.Password + "')", connection);
            connection.Open();
            int i = cmd.ExecuteNonQuery();
            connection.Close();
            if (i>0)
            {
                return "data inserted";
            }
            else
            {
                return "Error";
            }

            return "";
        }
    }
}
