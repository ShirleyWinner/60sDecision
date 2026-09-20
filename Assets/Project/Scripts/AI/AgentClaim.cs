using UnityEngine;

public enum GroundingStatus
{
    Grounded,
    PartiallyGrounded,
    Unsupported,
    Contradicted
}

[System.Serializable]
public class AgentClaim
{
    public string claimId;

    [TextArea(2, 5)]
    public string claimText;

    [Header("Evidence")]
    public EvidenceData[] supportingEvidence;
    public EvidenceData[] contradictingEvidence;

    [Header("Grounding")]
    public GroundingStatus groundingStatus;

    [TextArea(2, 4)]
    public string failureExplanation;
}