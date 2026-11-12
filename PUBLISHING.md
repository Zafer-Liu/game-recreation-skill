# Publishing and maintenance

The repository distributes a reusable skill, reference documents, specification templates, and tools. It contains no finished game, reference-game assets, or prebuilt game artifacts.

The public entry point is [README.md](README.md), with a [Simplified Chinese version](README.zh-CN.md). Keep both descriptions consistent with the files and capabilities actually shipped.

## Permission boundaries

Creating a remote, changing visibility, making a commit, pushing, and deploying are separate actions. Perform them when the user has authorized the corresponding work; an explicit request to publish this repository publicly covers its initial commit, public remote, push, description, and repository topics. It does not authorize installing dependencies, running builds/tests, publishing generated games, or deploying a demo.

For later maintenance, preserve the user's current authorization rather than treating this document as standing permission to publish every change.

## Publication checklist

- Review the staged files. Exclude credentials, downloaded references, generated games, dependencies, runtime outputs, and local `.work/` review files.
- Check UTF-8/LF, whitespace, documentation links, and the declared validation status. Do not label unexecuted tools or regression scenarios as passing tests.
- Use the project author name `Zafer_Liu`; prefer an account-appropriate GitHub noreply email for public commits. Keep author configuration local to the checkout.
- Check whether the intended remote already exists before creating or pushing. Do not overwrite unrelated repository history.
- Publish the authorized branch and visibility, then verify the remote URL, branch, commit, README files, description, and topics.
- Add clone/install URLs only after the actual repository exists. Do not invent release, demo, CI, or benchmark links.

GitHub Pages is optional and is not required for this skill. Generated games have their own licensing, validation, and deployment decisions. Repository topics describe this project; release/version tags should correspond to an intentional versioned release.
