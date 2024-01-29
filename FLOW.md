A -> B
S -> A (pA) valid pass
S <- A (pA) req opp
S -> A (opp) opp list
S <- A (pA, pB opp) req match
S -> B (pA opp) req word
S <- B (pB, pA opp) check word
S -> B (pA opp) req word
or
S -> A (pA, pB opp) req hint
S <- A (pB opp) send hint
S -> B (pA opp) show hint
S <- B (pB, pA opp) check word
