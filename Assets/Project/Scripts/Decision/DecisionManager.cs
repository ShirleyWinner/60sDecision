using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DecisionManager : MonoBehaviour
{
    public AgentData SelectedAgent { get; private set; }
    public bool AgentIsLocked { get; private set; }
    public string FinalDecisionId { get; private set; }
    public bool HasMadeFinalDecision => !string.IsNullOrEmpty(FinalDecisionId);

    public event Action<AgentData> OnAgentLocked;
    public event Action<string, bool> OnClueTrustChanged;
    public event Action<DecisionOption, bool> OnFinalDecisionMade;

    private readonly Dictionary<string, bool> clueTrustMap = new Dictionary<string, bool>();
    private bool wasDecisionCorrect;

    // 返回 false 说明已经锁定过，UI 可以用来提示"只能选一个 Agent"
    public bool TrySelectAgent(AgentData agent)
    {
        if (AgentIsLocked) return false;

        SelectedAgent = agent;
        AgentIsLocked = true;
        OnAgentLocked?.Invoke(agent);
        return true;
    }

    public void SetClueTrust(string clueId, bool trusted)
    {
        clueTrustMap[clueId] = trusted;
        OnClueTrustChanged?.Invoke(clueId, trusted);
    }

    // 返回 false 说明已经做过最终决定
    public bool TryMakeFinalDecision(string decisionId, ScenarioData scenario)
    {
        if (HasMadeFinalDecision) return false;

        FinalDecisionId = decisionId;
        wasDecisionCorrect = (decisionId == scenario.correctDecisionId);

        DecisionOption chosen = System.Array.Find(
            scenario.decisionOptions, d => d.decisionId == decisionId);

        OnFinalDecisionMade?.Invoke(chosen, wasDecisionCorrect);
        return true;
    }

    public IReadOnlyDictionary<string, bool> GetClueTrustMap() => clueTrustMap;
    public bool WasDecisionCorrect() => wasDecisionCorrect;

    public void Reset()
    {
        SelectedAgent = null;
        AgentIsLocked = false;
        FinalDecisionId = null;
        wasDecisionCorrect = false;
        clueTrustMap.Clear();
    }
}
