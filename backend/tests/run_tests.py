import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from tests.test_audit_trust import (
    test_quote_validator_exact_and_fuzzy,
    test_quote_validator_drops_fabricated_finding,
    test_numeric_currency_normalization,
    test_prompt_injection_guardrail,
    test_hash_chain_tamper_detection
)

def run():
    print("=" * 60)
    print("VENTORA TRUST SUITE: RUNNING CRITICAL VERIFICATION TESTS")
    print("=" * 60)

    tests = [
        ("Quote Validator (Exact & Fuzzy)", test_quote_validator_exact_and_fuzzy),
        ("Drop Fabricated Finding (Anti-Hallucination)", test_quote_validator_drops_fabricated_finding),
        ("Deterministic Currency Normalization", test_numeric_currency_normalization),
        ("Prompt Injection Guardrail & Sanitization", test_prompt_injection_guardrail),
        ("SHA-256 Hash Chain Tamper Detection", test_hash_chain_tamper_detection),
    ]

    passed = 0
    for name, test_fn in tests:
        try:
            test_fn()
            print(f"  ✅ PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  ❌ FAIL: {name} -> {e}")

    print("=" * 60)
    print(f"RESULTS: {passed}/{len(tests)} tests passed.")
    print("=" * 60)

    if passed == len(tests):
        print("🎉 ALL TRUST ASSURANCES VERIFIED IN CODE.")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    run()

