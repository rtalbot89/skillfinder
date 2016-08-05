using System;
using System.Collections;
using System.Collections.Generic;
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
            // Add Neo4J user and password
            _graphClient = new GraphClient(new Uri("http://localhost:7474/db/data"),"user", "password");
            _graphClient.Connect();
            _repository = new SkillRepository(_graphClient);
        }

        [Test()]
        public void GetProfileFromUserNameTest()
        {
            var ou = new ClientNode {  Name = "testou" };
            var user = new User {  Name = "test user", UserName = "tuser" };
            var skill = new ClientNode {  Name = "test skill" };
            _graphClient.Cypher
            .Create("(:Skill {skill})<-[:HAS_SKILL]-(:User {user})-[:WORKS_IN]->(:OU {ou})")
            .WithParams(new { skill, user, ou })
            .ExecuteWithoutResults();

            var result = _repository.GetProfileFromUserName("tuser");

            Assert.IsNotNull(result);

            var noResult = _repository.GetProfileFromUserName("xuser");

            Assert.IsNull(noResult);
        }

        [Test()]
        public void AllUsersWithSkillsTest()
        {
            var ou = new ClientNode {Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skill = new ClientNode {Name = "test skill" };
            _graphClient.Cypher
            .Create("(:Skill {skill})<-[:HAS_SKILL]-(:User {user})-[:WORKS_IN]->(:OU {ou})")
            .WithParams(new { skill, user, ou })
            .ExecuteWithoutResults();

            var result = _repository.AllUsersWithSkills();

            Assert.IsNotNull(result);
        }

        [Test()]
        public void UserHasSkillsTest()
        {
            var ou = new ClientNode { Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skill = new ClientNode {  Name = "test skill" };
            _graphClient.Cypher
            .Create("(:Skill {skill})<-[:HAS_SKILL]-(:User {user})-[:WORKS_IN]->(:OU {ou})")
            .WithParams(new { skill, user, ou })
            .ExecuteWithoutResults();

            var skills = new[] {"test skill", "x skill"};
            var result = _repository.UserHasSkills(skills);

            Assert.IsNotNull(result);

            var noSkills = new[] { "y skill", "z skill" };
            var noResult = _repository.UserHasSkills(noSkills);

            Assert.IsEmpty(noResult);
        }

        [Test()]
        public void AllProfilesTest()
        {
            var ou = new ClientNode { Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skill = new ClientNode { Name = "test skill" };
            _graphClient.Cypher
            .Create("(:Skill {skill})<-[:HAS_SKILL]-(:User {user})-[:WORKS_IN]->(:OU {ou})")
            .WithParams(new { skill, user, ou })
            .ExecuteWithoutResults();

            var result = _repository.AllProfiles();
            Assert.IsNotNull(result);
            Assert.IsInstanceOf<IEnumerable>(result);

        }

        [Test]
        public void CreateProfileTest()
        {
            var ou = new ClientNode { Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skills = new List<ClientNode> {new ClientNode {Name = "testskill"} };
            var profile = new Profile {User = user, Ou = ou, Skills = skills};
            _repository.CreateProfile(profile);
            var result = _repository.GetProfileFromUserName("tuser");

            Assert.IsNotNull(result);
            Assert.AreEqual("tuser", result.User.UserName);
        }

        [Test]
        public void UpdateProfileTest()
        {
            var ou = new ClientNode { Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skills = new List<ClientNode> { new ClientNode { Name = "testskill" } };
            var profile = new Profile { User = user, Ou = ou, Skills = skills };
            _repository.CreateProfile(profile);

            var updatedProfile = profile;
            updatedProfile.Ou.Name = "updatedou";

            _repository.UpdateProfile(updatedProfile);

            var result = _repository.GetProfileFromUserName("tuser");
            Assert.AreEqual("updatedou", result.Ou.Name);
        }

        [Test]
        public void RemoveProfileTest()
        {
            var ou = new ClientNode { Name = "testou" };
            var user = new User { Name = "test user", UserName = "tuser" };
            var skills = new List<ClientNode> { new ClientNode { Name = "testskill" } };
            var profile = new Profile { User = user, Ou = ou, Skills = skills };
            _repository.CreateProfile(profile);

            var result = _repository.GetProfileFromUserName("tuser");

            Assert.IsNotNull(result);

            _repository.RemoveProfile("tuser");

            var updatedResult = _repository.GetProfileFromUserName("tuser");

            Assert.IsNull(updatedResult);
        }

        [Test]
        public void OrgSuggestTest()
        {
            var newOu = new ClientNode { Name = "testou"};
            _graphClient.Cypher
                .Create("(ou:OU {newOu})")
                .WithParam("newOu", newOu)
                .ExecuteWithoutResults();

            var result = _repository.OrgSuggest("testou");

            Assert.IsNotNull(result);
        }

        [Test]
        public void SkillSuggestTest()
        {
            var newSkill = new ClientNode { Name = "testskill" };
            _graphClient.Cypher
                .Create("(skill:Skill {newSkill})")
                .WithParam("newSkill", newSkill)
                .ExecuteWithoutResults();

            var result = _repository.SkillSuggest("testskill");

            Assert.IsNotNull(result);
        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}