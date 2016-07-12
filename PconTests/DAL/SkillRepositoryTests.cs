using System;
using System.Collections;
using Neo4jClient;
using Neo4jClient.Transactions;
using NUnit.Framework;
using Pcon.DAL;
using Pcon.Models;

namespace PconTests.DAL
{
    [TestFixture()]
    public class SkillRepositoryTests
    {
        // Integration test method from https://neo4j.com/blog/integration-testing-neo4j-c-sharp/
        [SetUp]
        public void SetupTransactionContext()
        {
            _graphClient.BeginTransaction();
        }

        [TearDown]
        public void EndTransactionContext()
        {
            _graphClient.EndTransaction();
        }

        private SkillRepository _repository;
        private ITransactionalGraphClient _graphClient;

        [OneTimeSetUp]
        public void SetupTests()
        {
            _graphClient = new GraphClient(new Uri("http://localhost:7474/db/data"),"neo4j", "t3ng0que");
            _graphClient.Connect();

            _repository = new SkillRepository(_graphClient);

            var ou = new OU { Id = 1, Name = "testou" };
            var user = new User { Id = 1, Name = "test user", UserName = "tuser"};
            var skill = new Skill { Id = 1, Name = "test skill" };

            _graphClient.Cypher
               .Create("(:Skill {skill})<-[:HAS_SKILL]-(:User {user})-[:WORKS_IN]->(:OU {ou})")
               .WithParams(new { skill, user, ou })
               .ExecuteWithoutResults();
        }

        [Test()]
        public void AllUsersAndOusTest()
        {
            var result = _repository.AllUsersAndOus();

            Assert.IsNotNull(result);
        }

        [Test()]
        public void GetProfileFromIdTest()
        {
            var result = _repository.GetProfileFromId("1");

            Assert.IsNotNull(result);

            var noResult = _repository.GetProfileFromId("2");

            Assert.IsEmpty((IEnumerable) noResult);
        }

        [Test()]
        public void GetProfileFromUserNameTest()
        {
            var result = _repository.GetProfileFromUserName("tuser");

            Assert.IsNotNull(result);

            var noResult = _repository.GetProfileFromUserName("xuser");

            Assert.IsEmpty((IEnumerable)noResult);
        }

        [Test()]
        public void AllUsersWithSkillsTest()
        {
            var result = _repository.AllUsersWithSkills();

            Assert.IsNotNull(result);
        }

        [Test()]
        public void GetUserWithSkillsTest()
        {
            var result = _repository.GetUserWithSkills("test skill");

            Assert.IsNotNull(result);

            var noResult = _repository.GetUserWithSkills("no skill");

            Assert.IsEmpty((IEnumerable)noResult);
        }

        [Test()]
        public void UserHasSkillsTest()
        {
            var skills = new[] {"test skill", "x skill"};
            var result = _repository.UserHasSkills(skills);

            Assert.IsNotNull(result);

            var noSkills = new[] { "y skill", "z skill" };
            var noResult = _repository.UserHasSkills(noSkills);

            Assert.IsEmpty((IEnumerable)noResult);
        }

        [Test()]
        public void UsersAllSkillsTest()
        {
            var result = _repository.UsersAllSkills();

            Assert.IsNotNull(result);
        }

        [Test()]
        public void CreateProfileTest()
        {
            var profile = new Profile
            {
                Name = "user two",
                Organisation = "dept two",
                Skills = new[] {"one", "two", "three"}
            };
            const string userName = "nuser";

            _repository.CreateProfile(profile, userName);

            var result = _repository.GetProfileFromUserName(userName);

            Assert.IsNotNull(result);
        }
    }
}