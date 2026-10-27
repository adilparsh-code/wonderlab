# WonderLab game-universe implementation plan — 27 October 2026

Preserve the current branch,22pendingfiles and all8existing game routes. Existing8games are counted only after the legacy browser flows pass. Add42 distinct playable games to reach50:9 Space & Physics,9 Science Lab,9 Coding & Logic,9 Maths & Brain,6 Adventure & Strategy. Do not count a renamed quiz or static model as a new verified game.

Architecture: retain the existing catalog/static route and local progress schema. New metadata has an engine family, distinct mechanic and takeaway. Five lazy-loaded family boards implement the actual varied interactions; a shared shell owns three stages, feedback, mistakes/score, reset/replay and validated storage. Every new score is0–100, with completion only after three correct stages. No arbitrary code execution, external assets or network APIs.

Library: preserve design tokens and legacy subject/difficulty controls; add five universe-category filters, neutral ordering, real local completion/XP/achievement overview, truthful replay actions and locally selected discovery picks. No fabricated popularity, dates/history, resume state or student identifiers. XP/achievements derive from unique saved completions, with no new storage keys or telemetry.

Implementation: independent category modules have disjoint files and use BoardProps/UniverseGameSpec from src/lib/universe/types.ts. Every game gets functional3-stage unit tests and an independent browser action fixture. Parent integrates shell/catalog/library/progress, tests all existing flows and all42new start/play/finish/reset/replay routes. Verify registry, answers, storage, timing, mobile/keyboard, requests, build/static export and existing security gates. Current Phase4B export-checker limitations and production/legal gates remain separate; do not silently declare them fixed or deploy.

Scope controls: no branch switch, stage, commit, push, PR, merge, production settings or paid service. Original22files archived in /tmp/wonderlab-universe-existing-work.tar.gz with manifest. Baseline and final counts/commands/evidence go in the catalogue/report. Report implemented vs verified separately.
