import json
import sys
from pathlib import Path


# ============================================================
# PATH CONFIGURATION
# ============================================================

ROOT = Path(__file__).resolve().parents[1]

GROUND_TRUTH_PATH = (
    ROOT / "Assets/Project/Data/GroundTruth/snowstorm_ground_truth.json"
)

EVIDENCE_PATH = (
    ROOT / "Assets/Project/Data/Evidence/snowstorm_evidence.json"
)

AGENTS_PATH = (
    ROOT / "Assets/Project/Data/Agents/snowstorm_agents.json"
)

SCENARIO_PATH = (
    ROOT / "Assets/Project/Data/Scenarios/snowstorm_scenario.json"
)


# ============================================================
# HELPERS
# ============================================================

def load_json(path):
    if not path.exists():
        print(f"[FATAL] File not found: {path}")
        sys.exit(1)

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    except json.JSONDecodeError as e:
        print(f"[FATAL] Invalid JSON: {path}")
        print(e)
        sys.exit(1)


def add_pass(message):
    passes.append(message)


def add_warning(message):
    warnings.append(message)


def add_error(message):
    errors.append(message)


# ============================================================
# LOAD ALL CONTENT
# ============================================================

ground_truth = load_json(GROUND_TRUTH_PATH)
evidence_data = load_json(EVIDENCE_PATH)
agent_data = load_json(AGENTS_PATH)
scenario = load_json(SCENARIO_PATH)

passes = []
warnings = []
errors = []


# ============================================================
# BUILD LOOKUP TABLES
# ============================================================

routes = ground_truth.get("routes", [])
evidence_records = evidence_data.get("evidence", [])
agents = agent_data.get("agents", [])
decision_options = scenario.get("decisionOptions", [])


routes_by_id = {
    route["decisionId"]: route
    for route in routes
}

evidence_by_id = {
    evidence["evidenceId"]: evidence
    for evidence in evidence_records
}

agents_by_id = {
    agent["agentId"]: agent
    for agent in agents
}

scenario_decisions_by_id = {
    decision["decisionId"]: decision
    for decision in decision_options
}


# ============================================================
# 1. DUPLICATE ID CHECKS
# ============================================================

if len(routes_by_id) != len(routes):
    add_error("Duplicate Ground Truth decisionId detected.")
else:
    add_pass("Ground Truth decision IDs are unique.")


if len(evidence_by_id) != len(evidence_records):
    add_error("Duplicate Evidence IDs detected.")
else:
    add_pass("Evidence IDs are unique.")


if len(agents_by_id) != len(agents):
    add_error("Duplicate Agent IDs detected.")
else:
    add_pass("Agent IDs are unique.")


if len(scenario_decisions_by_id) != len(decision_options):
    add_error("Duplicate Scenario decision IDs detected.")
else:
    add_pass("Scenario decision IDs are unique.")


# ============================================================
# 2. GROUND TRUTH CHECK
# ============================================================

ground_truth_id = ground_truth.get("groundTruthId")

if not ground_truth_id:
    add_error(
        "Ground Truth JSON does not define groundTruthId."
    )
else:
    add_pass(
        f"Ground Truth ID exists: {ground_truth_id}"
    )


if not routes:
    add_error("Ground Truth contains no routes.")
else:
    add_pass(
        f"Ground Truth contains {len(routes)} routes."
    )


# ============================================================
# 3. SCENARIO → GROUND TRUTH REFERENCE
# ============================================================

scenario_ground_truth_id = scenario.get("groundTruthId")

if scenario_ground_truth_id == ground_truth_id:
    add_pass(
        "Scenario GroundTruth reference is valid."
    )
else:
    add_error(
        "Scenario groundTruthId does not match Ground Truth JSON. "
        f"Scenario='{scenario_ground_truth_id}', "
        f"GroundTruth='{ground_truth_id}'"
    )


# ============================================================
# 4. SCENARIO → EVIDENCE REFERENCES
# ============================================================

scenario_evidence_ids = scenario.get("evidenceIds", [])

unknown_evidence = [
    evidence_id
    for evidence_id in scenario_evidence_ids
    if evidence_id not in evidence_by_id
]

if unknown_evidence:
    add_error(
        "Scenario references unknown Evidence IDs: "
        f"{unknown_evidence}"
    )
else:
    add_pass(
        "All Scenario Evidence references are valid."
    )


# Detect Evidence that exists but is not included in Scenario

unused_evidence = (
    set(evidence_by_id.keys())
    - set(scenario_evidence_ids)
)

if unused_evidence:
    add_warning(
        "Evidence exists but is not included in Scenario: "
        f"{sorted(unused_evidence)}"
    )
else:
    add_pass(
        "All Evidence records are included in Scenario."
    )


# ============================================================
# 5. SCENARIO → AGENT REFERENCES
# ============================================================

scenario_agent_ids = scenario.get("agentIds", [])

unknown_agents = [
    agent_id
    for agent_id in scenario_agent_ids
    if agent_id not in agents_by_id
]

if unknown_agents:
    add_error(
        "Scenario references unknown Agent IDs: "
        f"{unknown_agents}"
    )
else:
    add_pass(
        "All Scenario Agent references are valid."
    )


unused_agents = (
    set(agents_by_id.keys())
    - set(scenario_agent_ids)
)

if unused_agents:
    add_warning(
        "Agents exist but are not included in Scenario: "
        f"{sorted(unused_agents)}"
    )
else:
    add_pass(
        "All Agents are included in Scenario."
    )


# ============================================================
# 6. SCENARIO DECISIONS ↔ GROUND TRUTH ROUTES
# ============================================================

scenario_decision_ids = set(
    scenario_decisions_by_id.keys()
)

ground_truth_decision_ids = set(
    routes_by_id.keys()
)


missing_in_ground_truth = (
    scenario_decision_ids
    - ground_truth_decision_ids
)

missing_in_scenario = (
    ground_truth_decision_ids
    - scenario_decision_ids
)


if missing_in_ground_truth:
    add_error(
        "Scenario decisions missing from Ground Truth: "
        f"{sorted(missing_in_ground_truth)}"
    )

if missing_in_scenario:
    add_error(
        "Ground Truth routes missing from Scenario: "
        f"{sorted(missing_in_scenario)}"
    )

if not missing_in_ground_truth and not missing_in_scenario:
    add_pass(
        "Scenario decisions and Ground Truth routes match."
    )


# ============================================================
# 7. CORRECT / REFERENCE DECISION CHECK
# ============================================================

correct_decision_id = scenario.get("correctDecisionId")

if not correct_decision_id:
    add_warning(
        "Scenario does not define correctDecisionId."
    )

elif correct_decision_id not in scenario_decisions_by_id:
    add_error(
        f"correctDecisionId '{correct_decision_id}' "
        "does not exist in Scenario decisionOptions."
    )

elif correct_decision_id not in routes_by_id:
    add_error(
        f"correctDecisionId '{correct_decision_id}' "
        "does not exist in Ground Truth routes."
    )

else:
    add_pass(
        f"Reference decision is valid: {correct_decision_id}"
    )


# ============================================================
# 8. EVIDENCE → DECISION REFERENCES
# ============================================================

for evidence in evidence_records:

    evidence_id = evidence["evidenceId"]

    supported_decision = evidence.get(
        "supportsDecisionId", ""
    )

    if (
        supported_decision
        and supported_decision
        not in routes_by_id
    ):
        add_error(
            f"{evidence_id}: supports unknown decision "
            f"'{supported_decision}'."
        )


if not any(
    "supports unknown decision" in error
    for error in errors
):
    add_pass(
        "All Evidence decision references are valid."
    )


# ============================================================
# 9. AGENT RECOMMENDATION CHECKS
# ============================================================

for agent in agents:

    agent_id = agent["agentId"]

    recommendation = agent.get(
        "recommendedDecisionId"
    )

    if recommendation not in routes_by_id:
        add_error(
            f"{agent_id}: recommendedDecisionId "
            f"'{recommendation}' does not exist."
        )


if not any(
    "recommendedDecisionId" in error
    for error in errors
):
    add_pass(
        "All Agent recommendation references are valid."
    )


# ============================================================
# 10. AGENT-LEVEL EVIDENCE REFERENCES
# ============================================================

for agent in agents:

    agent_id = agent["agentId"]

    used = set(
        agent.get("evidenceUsedIds", [])
    )

    missing = set(
        agent.get("evidenceMissingIds", [])
    )

    for evidence_id in used:

        if evidence_id not in evidence_by_id:
            add_error(
                f"{agent_id}: unknown evidenceUsedId "
                f"'{evidence_id}'."
            )

    for evidence_id in missing:

        if evidence_id not in evidence_by_id:
            add_error(
                f"{agent_id}: unknown evidenceMissingId "
                f"'{evidence_id}'."
            )

    overlap = used & missing

    if overlap:
        add_error(
            f"{agent_id}: Evidence appears in both "
            f"used and missing: {sorted(overlap)}"
        )


if not any(
    "evidenceUsedId" in error
    or "evidenceMissingId" in error
    or "used and missing" in error
    for error in errors
):
    add_pass(
        "All Agent-level Evidence references are valid."
    )


# ============================================================
# 11. CLAIM CHECKS
# ============================================================

allowed_grounding_statuses = {
    "Grounded",
    "PartiallyGrounded",
    "Unsupported",
    "Contradicted"
}

claim_ids = set()
claim_count = 0


for agent in agents:

    agent_id = agent["agentId"]

    for claim in agent.get("claims", []):

        claim_count += 1

        claim_id = claim.get("claimId")

        if not claim_id:
            add_error(
                f"{agent_id}: Claim missing claimId."
            )
            continue

        if claim_id in claim_ids:
            add_error(
                f"Duplicate claimId detected: {claim_id}"
            )

        claim_ids.add(claim_id)

        supporting = claim.get(
            "supportingEvidenceIds", []
        )

        contradicting = claim.get(
            "contradictingEvidenceIds", []
        )

        status = claim.get(
            "groundingStatus"
        )


        # ----------------------------------------------------
        # Evidence references exist
        # ----------------------------------------------------

        for evidence_id in supporting:

            if evidence_id not in evidence_by_id:
                add_error(
                    f"{claim_id}: unknown supporting "
                    f"Evidence '{evidence_id}'."
                )


        for evidence_id in contradicting:

            if evidence_id not in evidence_by_id:
                add_error(
                    f"{claim_id}: unknown contradicting "
                    f"Evidence '{evidence_id}'."
                )


        # ----------------------------------------------------
        # Evidence cannot support AND contradict same claim
        # ----------------------------------------------------

        overlap = (
            set(supporting)
            & set(contradicting)
        )

        if overlap:
            add_error(
                f"{claim_id}: Evidence appears as both "
                f"supporting and contradicting: "
                f"{sorted(overlap)}"
            )


        # ----------------------------------------------------
        # Grounding Status
        # ----------------------------------------------------

        if status not in allowed_grounding_statuses:

            add_error(
                f"{claim_id}: invalid groundingStatus "
                f"'{status}'."
            )


        # ----------------------------------------------------
        # Grounded rules
        # ----------------------------------------------------

        if status == "Grounded":

            if not supporting:
                add_warning(
                    f"{claim_id}: Grounded claim has no "
                    "supporting Evidence."
                )

            if contradicting:
                add_warning(
                    f"{claim_id}: Grounded claim also has "
                    "contradicting Evidence."
                )


        # ----------------------------------------------------
        # Unsupported rules
        # ----------------------------------------------------

        if status == "Unsupported":

            if supporting:
                add_warning(
                    f"{claim_id}: Unsupported claim contains "
                    "supporting Evidence."
                )

            if contradicting:
                add_warning(
                    f"{claim_id}: Unsupported claim contains "
                    "contradicting Evidence. Consider whether "
                    "the status should be Contradicted."
                )


        # ----------------------------------------------------
        # Contradicted rules
        # ----------------------------------------------------

        if status == "Contradicted":

            if not contradicting:
                add_warning(
                    f"{claim_id}: Contradicted claim has no "
                    "contradicting Evidence."
                )


        # ----------------------------------------------------
        # Partially Grounded rules
        # ----------------------------------------------------

        if status == "PartiallyGrounded":

            if not supporting:
                add_warning(
                    f"{claim_id}: PartiallyGrounded claim "
                    "has no supporting Evidence."
                )


        # ----------------------------------------------------
        # Failure explanation
        # ----------------------------------------------------

        explanation = claim.get(
            "failureExplanation", ""
        ).strip()

        if status != "Grounded" and not explanation:

            add_warning(
                f"{claim_id}: {status} claim has no "
                "failureExplanation."
            )


# ============================================================
# 12. CLAIM COUNT / UNIQUENESS
# ============================================================

if claim_count == len(claim_ids):
    add_pass(
        f"All {claim_count} Claim IDs are unique."
    )


# ============================================================
# 13. SCENARIO GAME RULE SANITY CHECKS
# ============================================================

game_rules = scenario.get(
    "gameRules", {}
)

total_time = game_rules.get(
    "totalTimeSeconds"
)

agent_cost = game_rules.get(
    "agentInspectionTimeCostSeconds"
)

evidence_cost = game_rules.get(
    "evidenceInspectionTimeCostSeconds"
)

max_agent_selections = game_rules.get(
    "maxAgentSelections"
)


if total_time is None or total_time <= 0:
    add_error(
        "Scenario totalTimeSeconds must be > 0."
    )

if agent_cost is None or agent_cost < 0:
    add_error(
        "agentInspectionTimeCostSeconds must be >= 0."
    )

if evidence_cost is None or evidence_cost < 0:
    add_error(
        "evidenceInspectionTimeCostSeconds must be >= 0."
    )

if (
    max_agent_selections is None
    or max_agent_selections < 1
):
    add_error(
        "maxAgentSelections must be >= 1."
    )


if (
    total_time is not None
    and agent_cost is not None
    and agent_cost > total_time
):
    add_warning(
        "Agent inspection cost exceeds total game time."
    )


if (
    total_time is not None
    and evidence_cost is not None
    and evidence_cost > total_time
):
    add_warning(
        "Evidence inspection cost exceeds total game time."
    )


# ============================================================
# 14. EXPECTED CONTENT COUNTS
# ============================================================

# These are warnings rather than hard errors because the
# content may intentionally change in future versions.

if len(routes) != 4:
    add_warning(
        f"Expected 4 Ground Truth routes, found {len(routes)}."
    )

if len(evidence_records) != 6:
    add_warning(
        f"Expected 6 Evidence records, "
        f"found {len(evidence_records)}."
    )

if len(agents) != 3:
    add_warning(
        f"Expected 3 Agents, found {len(agents)}."
    )

if claim_count != 18:
    add_warning(
        f"Expected 18 Claims, found {claim_count}."
    )


# ============================================================
# FINAL REPORT
# ============================================================

print("=" * 68)
print("60sDecision FINAL CROSS-FILE CONTENT AUDIT")
print("=" * 68)

print()
print("CONTENT SUMMARY")
print("-" * 68)

print(
    f"Scenario             : "
    f"{scenario.get('scenarioId', 'UNKNOWN')}"
)

print(
    f"Ground Truth         : "
    f"{ground_truth_id or 'MISSING'}"
)

print(
    f"Ground Truth Routes  : {len(routes)}"
)

print(
    f"Evidence Records     : {len(evidence_records)}"
)

print(
    f"Agents               : {len(agents)}"
)

print(
    f"Claims               : {claim_count}"
)

print(
    f"Decision Options     : {len(decision_options)}"
)

print()


# ------------------------------------------------------------
# PASS RESULTS
# ------------------------------------------------------------

print("CHECKS")
print("-" * 68)

for message in passes:
    print(f"[PASS] {message}")


# ------------------------------------------------------------
# WARNINGS
# ------------------------------------------------------------

print()

if warnings:

    print("WARNINGS")
    print("-" * 68)

    for warning in warnings:
        print(f"[WARN] {warning}")

else:
    print("[PASS] No structural warnings detected.")


# ------------------------------------------------------------
# ERRORS
# ------------------------------------------------------------

print()

if errors:

    print("ERRORS")
    print("-" * 68)

    for error in errors:
        print(f"[ERROR] {error}")

else:
    print("[PASS] No structural errors detected.")


# ------------------------------------------------------------
# RESULT
# ------------------------------------------------------------

print()
print("=" * 68)

if errors:
    print(
        f"RESULT: FAIL "
        f"({len(errors)} error(s), "
        f"{len(warnings)} warning(s))"
    )
    sys.exit(1)

elif warnings:
    print(
        f"RESULT: PASS WITH WARNINGS "
        f"({len(warnings)} warning(s))"
    )
    sys.exit(0)

else:
    print("RESULT: PASS")

print("=" * 68)