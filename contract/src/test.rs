#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_vote() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    // Vote for Question 1, Option 0
    client.vote(&voter1, &1, &0);
    client.vote(&voter2, &1, &0);

    let results = client.get_results(&1);
    assert_eq!(results.get(0).unwrap(), 2);
}

#[test]
#[should_panic(expected = "Voter already voted for this question")]
fn test_double_vote_fails() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let voter = Address::generate(&env);

    client.vote(&voter, &1, &0);
    client.vote(&voter, &1, &1); // Should panic
}
