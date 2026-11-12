# Game Recreation Skill

**English** · [简体中文](README.zh-CN.md)

A reference-driven skill for coding agents that turns game references into recognizable, playable slices—with explicit visual goals, ordinary-player validation, and optional offline single-file HTML delivery.

**This repository contains the skill, documentation, specification templates, and build tools. It does not contain a finished game or a game engine.**

## Why this skill

A successful build is not proof of a good recreation. A small bundle, a long feature list, or independently working modules can still produce a game that looks wrong or is difficult to play.

This skill connects three kinds of evidence:

- **Reference evidence:** what can actually be observed in gameplay, screenshots, recordings, or source material.
- **Player experience:** what a player can see, understand, and complete through the declared controls, starting from a clean state.
- **Delivery evidence:** which exact artifact was checked, what it contains, and whether its claimed offline behavior was tested.

The approach is to build one representative scene where visuals and interaction work together, validate a complete loop, and then expand content. Procedural assets, libraries, and licensed local resources are chosen for the experience—not for an arbitrary zero-asset or byte-count target.

## What you can use it for

- Recreate a focused gameplay experience from a playable URL, local HTML, screenshots, recordings, source material, or a game description.
- Analyze a reference without creating a game.
- Improve an existing recreation without replacing a working architecture.
- Package an existing web game as a self-contained HTML file when its assets and runtime support that format.

It applies to 2D puzzles, board games, platformers, 3D exploration, and other game types. It does not assume an FPS, Three.js, a particular model provider, or multi-agent orchestration. A large commercial game is scoped to a representative slice rather than treated as a promise to reproduce the entire game.

## Get started

Download or clone this repository, then give your coding agent access to it. No package installation is needed just to read or use the skill.

```bash
git clone https://github.com/Zafer-Liu/game-recreation-skill.git
```

### Install in a project

Copy the **entire** `skills/game-recreation/` directory to the location your agent supports:

| Agent setup | Destination |
| --- | --- |
| Claude Code project skill | `<project>/.claude/skills/game-recreation/` |
| Agents supporting `.agents/skills/` | `<project>/.agents/skills/game-recreation/` |
| Agents without skill discovery | Ask the agent to read `skills/game-recreation/SKILL.md` directly |

The skill directory includes its references, templates, scripts, and license. It can be distributed independently of the repository root. Discovery behavior depends on your agent.

**Language note:** the executable skill instructions, detailed references, and specification templates are currently written in Simplified Chinese. This README provides the English entry point; agents should read the original files rather than infer missing instructions from the overview.

### Give the agent a task

> Read `skills/game-recreation/SKILL.md`. Use the references I provide to build a recognizable, playable slice in a new project directory. Establish a representative visual target, a signature action, and a complete ordinary-player route. Make one scene meet both visual and interaction goals before expanding content. Choose procedural, original, or properly licensed assets as needed. Keep readable modular source and deliver an offline single-file HTML build where feasible. Follow the existing execution and publishing permissions. Report debug-fixture checks separately from normal gameplay, and label anything not tested.

Provide the reference location, output directory, target platform, and the experience you most want to preserve. If you only have a title, the agent should seek accessible reference evidence or state what remains inferred. Screenshots alone do not prove gameplay rules.

For an analysis-only request, explicitly say **“analyze only; do not create a game.”** More prompts are available in [examples/prompts.md](examples/prompts.md) (Chinese).

## Quality gates

The skill distinguishes a **mechanics prototype**, a **recognizable slice**, and a **high-fidelity recreation**. A normal recreation request starts with a recognizable slice; a greybox is an intermediate artifact unless a prototype was explicitly requested.

| Gate | Evidence required |
| --- | --- |
| **G0 — Credible target** | Reference sources or clearly stated inference limits, a delivery tier, and explicit visual and gameplay goals |
| **G1 — Representative scene** | A real rendered scene with the intended framing, silhouette, scale, lighting, and core interaction |
| **G2 — Ordinary-player route** | A complete loop from a clean start through normal controls, including success, failure, and restart |
| **G3 — Matching delivery** | The checked version corresponds to the delivered artifact, with the required independent-file and offline checks |

These are evidence requirements, not automatic quality scores or extra approval dialogs. A teleport, resource injection, direct entity merge, or forced win is useful for debugging but does not prove the player route. If the user asks for an early package, the agent should deliver it and state the remaining gaps.

Details: [quality gates](skills/game-recreation/references/quality-gates.md), [implementation](skills/game-recreation/references/procedural-implementation.md), and [verification](skills/game-recreation/references/verification.md). These documents are in Chinese.

## Included tools

The tools require **Node.js 22+**. The repository-level scripts use Node built-ins and do not require an npm install. Run them only within the permissions granted for your task.

### Inspect a local HTML reference

From this repository:

```bash
node skills/game-recreation/scripts/inspect-html.mjs ./reference.html
```

Prints JSON with raw/gzip bytes, a hash, script/style estimates, and static resource/API clues. It does **not** execute the HTML or write a report file. Its heuristic scan cannot prove offline behavior, runtime performance, authorship, or gameplay.

### Create a gameplay-free project shell

```bash
node skills/game-recreation/scripts/scaffold.mjs ../my-game my-game
```

The destination must not exist, its parent must exist, and the project name must use lowercase letters/digits separated by hyphens. The script copies a web shell and six specification templates into `docs/`. It does not install dependencies, build a game, initialize Git, or overwrite an existing project.

The generated page is a placeholder. Implementing and validating the game is a separate part of the workflow.

### Build a single-file HTML game

After implementing the game, run the following **in the generated project**, with the relevant execution permission:

```bash
npm install
```

```bash
npm run build
```

```bash
npm run verify:artifact
```

The template uses esbuild to bundle JavaScript as an inline classic-script IIFE, inline CSS, and preserve third-party license text. Production output goes to `dist/`; the development server (`npm run dev`, default port `8940`) generates and serves `.preview/` so it cannot overwrite the production package.

| Output | Purpose |
| --- | --- |
| `dist/index.html` | The single-file artifact; standalone only after the game and asset strategy are implemented and verified |
| `dist/build-report.json` | Mode, output directory, HTML SHA-256, raw/gzip bytes, and esbuild metadata |
| `dist/third-party-licenses.txt` | A license copy; the same text is embedded in the HTML |

`verify:artifact` reads the production HTML and report, then checks mode/directory, UTF-8/LF, raw/gzip bytes, SHA-256, replaced template markers, and the inline license block. **It does not evaluate gameplay, visual quality, or offline runtime behavior.**

The basic template accepts bundled JavaScript and one CSS entry; it rejects externalized imports and unsupported extra outputs. Embedded images, models, fonts, workers, or WASM require an explicit extension to the asset/build strategy, with license, size, and `file://` checks. Single-file delivery does not mean zero assets, and base64 is encoding rather than compression.

See the [template README](skills/game-recreation/templates/web-singlefile/README.md) and [single-file contract](skills/game-recreation/references/single-file-contract.md) (Chinese).

## Repository map

```text
skills/game-recreation/
  SKILL.md                     Skill entry point
  LICENSE                      License for the distributable skill
  references/                  Quality, reference analysis, implementation,
                               single-file delivery, and verification
  scripts/
    inspect-html.mjs           Read-only static HTML inspection
    scaffold.mjs               Non-overwriting project scaffolding
  templates/
    specs/                     Six documents, including quality-contract.md
    web-singlefile/            Gameplay-free HTML/JS/CSS build shell
      scripts/                 Build, dev, pipeline, artifact verification
examples/
  prompts.md                   Task examples (Chinese)
  regression-cases.md          Evaluation scenarios, not benchmark results
WORKFLOW.md                    Human-readable workflow (Chinese)
QUALITY_REVIEW.md              Design review and limitations (Chinese)
```

## Validation status and boundaries

The latest repository revision has received static checks for file integrity, UTF-8/LF, whitespace, JSON, and local documentation links. The revised scaffold, build pipeline, artifact verifier, and cross-game quality process have **not** been validated through an install/build/browser regression run in this repository. A historical downstream game run is not evidence that the revised template passes.

[Regression scenarios](examples/regression-cases.md) describe checks to run with permission; they are not completed tests or benchmark scores. There are no prebuilt games, performance guarantees, or measured claims that this workflow improves every model or game type.

Reference inputs remain read-only. Generated projects must respect the permissions and licenses of third-party code and assets. The workflow does not grant rights to proprietary characters, trademarks, music, or artwork. It requires no provider API keys, paid generation services, or automatic publishing.

## Contributing

Improvements should address transferable failure modes across game types. Include the reference conditions, observed failure, proposed change, and honest validation status. Keep required distribution files inside `skills/game-recreation/`, preserve UTF-8/LF, and keep downloaded references, credentials, generated games, and local review artifacts out of the repository.

## License

The skill, workflow, templates, and tools are licensed under [MIT](LICENSE), copyright © 2026 **Zafer_Liu**. Generated game content and third-party dependencies retain their own licensing requirements.

[zaferliu.me](https://www.zaferliu.me)
