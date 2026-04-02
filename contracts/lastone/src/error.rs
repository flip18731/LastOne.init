use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized: only {expected} can call this")]
    Unauthorized { expected: String },

    #[error("Incorrect payment: expected {expected} uinit, received {received}")]
    IncorrectPayment { expected: u128, received: u128 },

    #[error("Wrong denom: expected uinit, got {denom}")]
    WrongDenom { denom: String },

    #[error("Round is not active: current status is {status}")]
    RoundNotActive { status: String },

    #[error("Countdown has not expired yet: {seconds_remaining}s remaining")]
    CountdownNotExpired { seconds_remaining: u64 },

    #[error("Only the last entrant can claim the win")]
    NotLastEntrant,

    #[error("Round has already ended")]
    RoundAlreadyEnded,

    #[error("No funds provided")]
    NoFunds,

    #[error("Arithmetic overflow")]
    Overflow,
}
