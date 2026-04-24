#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Vec, Address, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Survey(u32),        // question_id
    Voter(Address, u32) // address, question_id (to prevent double voting)
}

#[contract]
pub struct SurveyContract;

#[contractimpl]
impl SurveyContract {
    /// Submit a vote for a specific question and option.
    pub fn vote(env: Env, voter: Address, question_id: u32, option_index: u32) {
        // 1. Verify voter has not voted for this question yet
        let key = DataKey::Voter(voter.clone(), question_id);
        if env.storage().has_persistent(&key) {
            panic!("Voter already voted for this question");
        }

        // 2. Authorization
        voter.require_auth();

        // 3. Update the vote count for the option
        let survey_key = DataKey::Survey(question_id);
        let mut results: Map<u32, u32> = env
            .storage()
            .get_persistent(&survey_key)
            .unwrap_or(Map::new(&env));

        let current_votes = results.get(option_index).unwrap_or(0);
        results.set(option_index, current_votes + 1);

        // 4. Save results back to storage
        env.storage().set_persistent(&survey_key, &results);

        // 5. Mark voter as having voted
        env.storage().set_persistent(&key, &true);
    }

    /// Get current results for a question.
    pub fn get_results(env: Env, question_id: u32) -> Map<u32, u32> {
        let survey_key = DataKey::Survey(question_id);
        env.storage()
            .get_persistent(&survey_key)
            .unwrap_or(Map::new(&env))
    }
}

mod test;
