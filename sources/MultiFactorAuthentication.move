module Shyni_addr::MultiFactorAuth {
    use aptos_framework::signer;
    use std::vector;
    use std::string::{Self, String};

    /// Error codes
    const E_NOT_REGISTERED: u64 = 1;
    const E_ALREADY_REGISTERED: u64 = 2;
    const E_INVALID_VERIFICATION: u64 = 3;
    const E_INSUFFICIENT_FACTORS: u64 = 4;

    /// Struct representing user's MFA configuration
    struct MFAProfile has store, key {
        verification_methods: vector<String>,  // List of enabled verification methods
        verified_factors: vector<String>,      // Currently verified factors in session
        is_authenticated: bool,                // Authentication status
        required_factors: u8,                  // Number of factors required for full auth
    }

    /// Function to register a user with MFA and set required verification methods
    public fun register_mfa(
        user: &signer, 
        verification_methods: vector<String>, 
        required_factors: u8
    ) {
        let user_addr = signer::address_of(user);
        
        // Check if user is already registered
        assert!(!exists<MFAProfile>(user_addr), E_ALREADY_REGISTERED);
        
        let mfa_profile = MFAProfile {
            verification_methods,
            verified_factors: vector::empty<String>(),
            is_authenticated: false,
            required_factors,
        };
        
        move_to(user, mfa_profile);
    }

    /// Function to verify a factor and update authentication status
    public fun verify_factor(
        user: &signer, 
        factor_type: String
    ) acquires MFAProfile {
        let user_addr = signer::address_of(user);
        
        // Check if user is registered
        assert!(exists<MFAProfile>(user_addr), E_NOT_REGISTERED);
        
        let mfa_profile = borrow_global_mut<MFAProfile>(user_addr);
        
        // Check if the factor type is in allowed verification methods
        assert!(vector::contains(&mfa_profile.verification_methods, &factor_type), E_INVALID_VERIFICATION);
        
        // Add to verified factors if not already present
        if (!vector::contains(&mfa_profile.verified_factors, &factor_type)) {
            vector::push_back(&mut mfa_profile.verified_factors, factor_type);
        };
        
        // Check if enough factors are verified for authentication
        let verified_count = vector::length(&mfa_profile.verified_factors);
        if (verified_count >= (mfa_profile.required_factors as u64)) {
            mfa_profile.is_authenticated = true;
        };
    }
}