# 60sDecision — Scenario Data

This folder contains the source data for the **Leviathan Storm Decision** scenario.

The data layer defines:

- Scenario ground truth
- Player-visible evidence
- AI agents and their claims
- Decision options
- Overall scenario configuration

> **Integration note:** These JSON files are the content/data contract for the scenario.  
> Unity integration, ScriptableObject creation/binding, and gameplay consumption are handled separately by the Unity integration team.

---

## 1. Folder Structure

```text
Assets/Project/Data/
├── GroundTruth/
│   └── snowstorm_ground_truth.json
├── Evidence/
│   └── snowstorm_evidence.json
├── Agents/
│   └── snowstorm_agents.json
├── Scenarios/
│   └── snowstorm_scenario.json
└── README.md
```

Validation tool:

```text
Tools/audit_content.py
```

---

## 2. Recommended Reading Order

For Unity integration, read the files in this order:

1. `GroundTruth/snowstorm_ground_truth.json`
2. `Evidence/snowstorm_evidence.json`
3. `Agents/snowstorm_agents.json`
4. `Scenarios/snowstorm_scenario.json`

Conceptually:

```text
Ground Truth
     ↓
Evidence
     ↓
Agent Claims
     ↓
Agents
     ↓
Scenario Assembly
```

The key design rule is:

> **Ground Truth is what is actually true. Evidence is what the player/AI can observe. Agent Claims are AI interpretations of that evidence.**

---

## 3. Ground Truth

**File:** `GroundTruth/snowstorm_ground_truth.json`

This file defines the authoritative state of the scenario.

It contains:

- Mission parameters
- Storm parameters
- Four route outcomes
- Expected travel times
- Damage-risk ranges
- Deadline buffers
- Calculation explanations

### Ground Truth ID

```text
SNOWSTORM_GROUND_TRUTH
```

### Decision IDs

```text
DIRECT
SMALL_DETOUR
LARGE_DETOUR
WAIT_DIRECT
```

### Important

Ground Truth is **not automatically player-visible information**.

Do not expose all Ground Truth values directly to the player unless the gameplay design specifically requires it.

This separation is intentional: an AI claim may contain correct arithmetic while still reaching an incorrect conclusion because it omitted a Ground Truth constraint.

---

## 4. Evidence

**File:** `Evidence/snowstorm_evidence.json`

The scenario contains six player/agent-accessible evidence records:

```text
E01
E02
E03
E04
E05
E06
```

Evidence represents information available during the decision rather than the complete authoritative state of the scenario.

### Data-Layer Separation

```text
Ground Truth
= What is actually true in the scenario

Evidence
= Information available to the player / AI

Agent Claim
= An AI interpretation of available evidence
```

These layers should remain separate during Unity integration.

---

## 5. AI Agents and Claims

**File:** `Agents/snowstorm_agents.json`

The scenario contains three AI agents:

```text
VIGIL
APEX
CIPHER
```

Each agent contains six claims:

```text
3 Agents × 6 Claims = 18 Claims
```

The agents are intentionally designed with different reasoning patterns rather than as simple "good AI" versus "bad AI" characters.

### VIGIL

**Focus:** Risk assessment / conservative planning

Typical reasoning pattern:

```text
Correct information
        +
risk exaggeration or omitted operational context
```

### APEX

**Focus:** Speed / mission efficiency

Typical reasoning pattern:

```text
Real evidence
        +
aggressive extrapolation
        +
overconfidence
```

### CIPHER

**Focus:** Black-box predictive modeling

Typical reasoning pattern:

```text
Unsupported assumption
        ↓
precise-looking calculation
        ↓
downstream conclusion
```

CIPHER demonstrates how an unsupported upstream assumption can propagate into a **cascading reasoning failure**.

---

## 6. Claim Grounding

Agent Claims reference Evidence using string IDs.

Example:

```json
{
  "supportingEvidenceIds": ["E01", "E03"],
  "contradictingEvidenceIds": [],
  "groundingStatus": "Grounded"
}
```

Conceptually:

```text
E01 + E03
    ↓
support this claim
```

### Valid Grounding Statuses

#### `Grounded`

Available evidence supports the claim.

#### `PartiallyGrounded`

Part of the claim is supported, but one or more assumptions, details, or conclusions are not fully supported.

#### `Unsupported`

Available evidence does not provide sufficient support for the claim.

**Absence of evidence does not automatically mean that a claim is contradicted.**

#### `Contradicted`

Available evidence directly conflicts with the claim.

For non-grounded claims, `failureExplanation` describes why the reasoning is incomplete, unsupported, or incorrect.

This field is intended to support the post-decision debrief and the game's **"explain why wrong"** learning objective.

---

## 7. Scenario Assembly

**File:** `Scenarios/snowstorm_scenario.json`

### Scenario ID

```text
SNOWSTORM_01
```

The Scenario file assembles the existing data through IDs:

```text
SNOWSTORM_01
│
├── groundTruthId
│   └── SNOWSTORM_GROUND_TRUTH
│
├── evidenceIds
│   └── E01–E06
│
├── agentIds
│   ├── VIGIL
│   ├── APEX
│   └── CIPHER
│
└── decisionOptions
    ├── DIRECT
    ├── SMALL_DETOUR
    ├── LARGE_DETOUR
    └── WAIT_DIRECT
```

The Scenario file should primarily **assemble existing content**.

Avoid duplicating Ground Truth or Evidence values inside the Scenario unless required by the gameplay implementation.

---

## 8. Reference Decision and Debrief

The current reference decision is:

```text
WAIT_DIRECT
```

Stored as:

```json
"correctDecisionId": "WAIT_DIRECT"
```

For V1, this field provides a reference decision for scoring and debriefing.

It should **not** be interpreted as a requirement that the UI simply label every other route as "wrong."

The debrief should instead help the player understand:

- Expected outcome of the selected route
- Evidence available during the decision
- Which AI claims were grounded
- Which claims were partially grounded
- Which claims were unsupported
- Which claims were contradicted
- Why a claim or recommendation failed
- Alternative route trade-offs

The learning objective is **AI trust calibration and decision quality**, not simply identifying a "good AI" and a "bad AI."

---

## 9. Unity Integration Handoff

The JSON files currently use **string IDs** for cross-file references.

They are not Unity object references yet.

For example:

```json
"supportingEvidenceIds": ["E06"]
```

Conceptually, the Unity integration layer should resolve this as:

```text
"E06"
   ↓
Find EvidenceData where evidenceId == "E06"
   ↓
Unity EvidenceData reference
```

The same principle applies to:

```text
groundTruthId
evidenceIds
agentIds
recommendedDecisionId
supportsDecisionId
decisionId
correctDecisionId
```

### Integration Ownership

The current data/content work provides:

```text
JSON content
+
stable IDs
+
C# data schemas
+
cross-file validation
```

The Unity integration side is responsible for deciding how these JSON records are consumed or converted into runtime/ScriptableObject references.

No assumption is made here that a JSON importer has already been implemented.

---

## 10. Validation

Before integrating any updated scenario data, run from the repository root:

```bash
python Tools/audit_content.py
```

### Current Expected Content

```text
Scenario             : SNOWSTORM_01
Ground Truth         : SNOWSTORM_GROUND_TRUTH
Ground Truth Routes  : 4
Evidence Records     : 6
Agents               : 3
Claims               : 18
Decision Options     : 4
```

Expected final result:

```text
RESULT: PASS
```

The audit validates structural/reference integrity across:

```text
Scenario
   │
   ├── Ground Truth
   │      └── Decisions
   │
   ├── Evidence
   │
   └── Agents
          └── Claims
```

The audit checks issues such as:

- Duplicate IDs
- Missing IDs
- Invalid Scenario references
- Invalid Decision references
- Invalid Agent references
- Invalid Evidence references
- Claim grounding structure
- Cross-file reference consistency

> **Important:** A structural `PASS` does not automatically prove that every natural-language AI claim is semantically correct. Claim/Evidence/Ground Truth relationships were also reviewed separately at the content-design level.

---

## 11. Integration Rules

### Do not change IDs independently

IDs are the contract connecting the JSON files.

For example, changing:

```text
E03
```

to:

```text
STORM_E03
```

in only one file will break Agent Claim references.

If an ID or schema field needs to change:

1. Update the relevant source JSON.
2. Update all dependent references.
3. Run:

   ```bash
   python Tools/audit_content.py
   ```

4. Confirm:

   ```text
   RESULT: PASS
   ```

5. Then integrate the updated data into Unity.

### Avoid duplicating authoritative values

Where possible:

```text
Ground Truth → authoritative values
Evidence     → player/AI-visible information
Agent Claims → interpretation
Scenario     → assembly/configuration
```

Keeping these responsibilities separate reduces inconsistent duplicated data.

---

## 12. Current Handoff Status

Current content version contains:

- **1** scenario
- **1** Ground Truth dataset
- **4** decision routes
- **6** Evidence records
- **3** AI Agents
- **18** Agent Claims
- Cross-file structural validation: **PASS**

The Data/Scenario content layer is ready for Unity-side integration.