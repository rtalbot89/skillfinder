using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    // Find profiles with skills
    public class SkillSearchController : ApiController
    {
        private readonly SkillRepository _skillRepository;
      
        public SkillSearchController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public SkillSearchController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }

        //Return a single profile from a query for one skill
        //public IHttpActionResult Get(string id)
        //{
        //    var profile = _skillRepository.GetUserWithSkills(id);
        //    return Ok(profile);
        //}

        // Get all profiles and skills
        public IHttpActionResult Get()
        {
            return Ok(_skillRepository.AllUsersWithSkills());
        }

        // From POST return profiles matching an array of skills
        public IHttpActionResult Post(string[] skills)
        {
            return Ok( _skillRepository.UserHasSkills(skills));
        }
    }
}
