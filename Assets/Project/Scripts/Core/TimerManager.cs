using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TimerManager : MonoBehaviour
{
    public float RemainingTime { get; private set; }
    public float ElapsedTime => totalDuration - RemainingTime;
    public bool IsRunning { get; private set; }

    public event Action<float> OnTick;
    public event Action OnExpired;

    private float totalDuration;

    public void Initialize(float totalSeconds)
    {
        totalDuration = totalSeconds;
        RemainingTime = totalSeconds;
        IsRunning = false;
    }

    public void StartTimer()
    {
        IsRunning = true;
    }

    public void StopTimer()
    {
        IsRunning = false;
    }

    public void DeductTime(float seconds)
    {
        RemainingTime = Mathf.Max(0f, RemainingTime - seconds);
        OnTick?.Invoke(RemainingTime);

        if (RemainingTime <= 0f && IsRunning)
        {
            IsRunning = false;
            OnExpired?.Invoke();
        }
    }

    void Update()
    {
        if (!IsRunning) return;

        RemainingTime -= Time.deltaTime;
        OnTick?.Invoke(RemainingTime);

        if (RemainingTime <= 0f)
        {
            RemainingTime = 0f;
            IsRunning = false;
            OnExpired?.Invoke();
        }
    }
}

