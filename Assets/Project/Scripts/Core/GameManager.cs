using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [SerializeField] private ScenarioData currentScenario;

    private TimerManager timerManager;
    private DecisionManager decisionManager;

    public GameState CurrentState { get; private set; } = GameState.Idle;
    public OutcomeType LastOutcome { get; private set; }
    public ScenarioData CurrentScenario => currentScenario;

    // UI 订阅这些事件来更新界面
    public event Action<GameState> OnStateChanged;
    public event Action<EvidenceData> OnClueRevealed;
    public event Action<OutcomeType, DecisionOption> OnOutcomeDetermined;

    private readonly HashSet<string> revealedEvidenceIds = new HashSet<string>();

    void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;

        timerManager = GetComponent<TimerManager>();
        decisionManager = GetComponent<DecisionManager>();
    }

    void Start()
    {
        timerManager.OnExpired += HandleTimerExpired;
    }

    // ── UI 调用的公开方法 ────────────────────────────────────────────────────

    public void StartGame()
    {
        if (CurrentState != GameState.Idle) return;

        revealedEvidenceIds.Clear();
        decisionManager.Reset();
        timerManager.Initialize(currentScenario.totalTimeSeconds);
        TransitionTo(GameState.ScenarioIntro);
    }

    // 玩家看完情节介绍点击确认，计时器此时才开始
    public void AcknowledgeScenarioIntro()
    {
        if (CurrentState != GameState.ScenarioIntro) return;
        timerManager.StartTimer();
        TransitionTo(GameState.Playing);
    }

    // 玩家选择 Agent 卡片，锁定后不可更改
    public void PlayerSelectsAgent(AgentData agent)
    {
        if (CurrentState != GameState.Playing) return;
        decisionManager.TrySelectAgent(agent);
    }

    // 玩家打开线索，扣 inspectTimeCostSeconds 秒（Optional 字段，0 则不扣）
    public void PlayerOpensClue(EvidenceData clue)
    {
        if (CurrentState != GameState.Playing) return;
        if (clue.inspectTimeCostSeconds > 0f)
            timerManager.DeductTime(clue.inspectTimeCostSeconds);
    }

    // 玩家对线索点信任 / 不信任，后端记录供 Debrief 分析
    public void PlayerTrustsClue(string clueId, bool trusted)
    {
        decisionManager.SetClueTrust(clueId, trusted);
    }

    // 玩家做出最终决定（绕航 / 等待 / 绕大圈 / 绕小圈）
    public void PlayerMakesFinalDecision(string decisionId)
    {
        if (CurrentState != GameState.Playing) return;
        if (!decisionManager.TryMakeFinalDecision(decisionId, currentScenario)) return;

        timerManager.StopTimer();

        LastOutcome = decisionManager.WasDecisionCorrect()
            ? OutcomeType.CorrectDecision
            : OutcomeType.IncorrectDecision;

        DecisionOption chosen = System.Array.Find(
            currentScenario.decisionOptions, d => d.decisionId == decisionId);

        OnOutcomeDetermined?.Invoke(LastOutcome, chosen);
        TransitionTo(GameState.OutcomeReveal);
    }

    public void ProceedToDebrief()
    {
        if (CurrentState != GameState.OutcomeReveal) return;
        TransitionTo(GameState.Debrief);
    }

    public void ReturnToIdle()
    {
        TransitionTo(GameState.Idle);
    }

    // ── 内部逻辑 ─────────────────────────────────────────────────────────────

    void Update()
    {
        if (CurrentState == GameState.Playing)
            CheckClueRevealSchedule();
    }

    // 根据 ClueData.revealTimeSeconds（已流逝时间）按序解锁线索
    void CheckClueRevealSchedule()
    {
        float elapsed = timerManager.ElapsedTime;
        foreach (EvidenceData clue in currentScenario.evidence)
        {
            if (!revealedEvidenceIds.Contains(clue.evidenceId) && elapsed >= clue.revealTimeSeconds)
            {
                revealedEvidenceIds.Add(clue.evidenceId);
                OnClueRevealed?.Invoke(clue);
            }
        }
    }

    void HandleTimerExpired()
    {
        if (CurrentState != GameState.Playing) return;

        LastOutcome = OutcomeType.TimeOut;
        OnOutcomeDetermined?.Invoke(LastOutcome, null);
        TransitionTo(GameState.OutcomeReveal);
    }

    void TransitionTo(GameState newState)
    {
        CurrentState = newState;
        OnStateChanged?.Invoke(newState);
    }
}
