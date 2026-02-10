---
description: Create an implementation plan with team orchestration
argument-hint: [description of what to build]
model: opus
disallowed-tools: Task, EnterPlanMode
---

# Plan

Create a detailed implementation plan based on the user's requirements. Analyze the request, design the solution, and save a specification document to `specs/<name>.md`.

## Variables

USER_PROMPT: $ARGUMENTS
PLAN_OUTPUT_DIRECTORY: `specs/`

## Instructions

- **PLANNING ONLY**: Do NOT build or write code. Output is a plan document only.
- If no `USER_PROMPT` is provided, ask the user to provide it.
- Analyze the user's requirements carefully.
- Understand the codebase to identify existing patterns.
- Create a comprehensive implementation plan.
- Save the plan to `specs/<descriptive-name>.md`.

## Plan Format

```md
# Plan: <task name>

## Task Description
<describe the task>

## Objective
<what will be accomplished>

## Relevant Files
<list files with explanations>

## Step by Step Tasks

### 1. <Task Name>
- **Depends On**: none | <task-id>
- **Parallel**: true | false
- <action items>

## Acceptance Criteria
<measurable criteria>

## Validation Commands
<commands to verify completion>
```

## Report

```
Plan Created: specs/<filename>.md
Topic: <brief description>

Tasks:
- <list>
```
