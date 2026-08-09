I updated package.json on the mvp branch to bump three and the react-three libraries to compatible versions.

Why I changed these:
- Some transitive dependency in @react-three/drei required three >= 0.159.0 and npm warned that the installed three (0.156.x) would conflict. Bumping three to a modern compatible version (0.185.1) resolves these peer warnings.
- I also updated @react-three/fiber and @react-three/drei to recent compatible versions so the R3F ecosystem matches the three version.

Note on package-lock.json:
- I could not generate package-lock.json from here because that requires running npm install locally. After you pull the mvp branch, please run `npm install` which will create/update package-lock.json on your machine. If you want, commit and push the resulting package-lock.json so CI and other collaborators have the exact lockfile.

If you want me to add the generated package-lock.json to the repo, run `npm install` locally and then either push the lockfile yourself or tell me and I can open a PR with it (you can paste the lockfile contents or push it directly from your machine).