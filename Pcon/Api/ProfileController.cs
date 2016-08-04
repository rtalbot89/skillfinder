using System.Web.Http;
using Pcon.Models;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class ProfileController : ApiController
    {
        private readonly SkillRepository _skillRepository;

        public ProfileController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public ProfileController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }

        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllProfiles();
            return Ok(profiles);
        }

        public IHttpActionResult Get(string id)
        {
            var profile = _skillRepository.GetProfileFromUserName(id);
            return Ok(profile);
        }

        public IHttpActionResult Post(Profile profile)
        {
            _skillRepository.CreateProfile(profile);
            return Ok();
        }

        public IHttpActionResult Put(Profile profile)
        {
            _skillRepository.UpdateProfile(profile);
            return Ok();
        }

        public IHttpActionResult Delete(string id)
        {
            _skillRepository.RemoveProfile(id);
            return Ok();
        }
    }
}
