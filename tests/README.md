# Password compatibility

Run `npm test` with Node.js 18 or newer. No dependency installation is needed.

The fixtures contain synthetic inputs and literal outputs captured from the
existing generator before the visual refresh. The tests execute the actual
`sha256.js` and `script.js` sources in a VM with a minimal DOM stub; they do not
replace hashing with a mock or duplicate the generation algorithm.

Coverage includes default settings, all symbol/capital combinations, several
lengths, seed case, whitespace, Latin-1 and Unicode inputs, one empty input,
and restoring settings after changes.

Some existing outputs are surprising: short lengths can incorporate text from
an undefined letter lookup, and the hash wrapper treats Latin-1 differently
from wider Unicode. These fixtures preserve compatibility, not a claim that
those behaviors are desirable. Any deliberate algorithm fix needs a separate
versioning decision rather than updated expected outputs to silence failures.

The interface tests also exercise live updates, invalid lengths, reveal controls,
clipboard success/failure, and system theme changes through a minimal DOM stub.
Rendered layout, native keyboard interactions, browser clipboard permissions,
and offline behavior still require browser checks.
