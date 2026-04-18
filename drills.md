# Stripe-Style Interview Drill Problems

Six multi-part problems matching Stripe's phone-screen format: Part 1 is tractable, later parts extend into NP-hard territory. Use these for live-coding practice with a 60-minute timer.

**How to use:** Read Part 1, ask clarifying questions out loud, solve it. Then unlock Part 2, adapt your code. Then Part 3 — practice recognizing the NP-hard canonical problem and proposing a heuristic. Don't try to solve Part 3 optimally.

---

## Drill 1: Payment Batch Routing

**Part 1.** You have a list of payments `[{id, amount, currency}]` and a list of processors `[{name, supported_currencies, fee_percent}]`. For each payment, assign it to the cheapest processor that supports its currency. Output the assignments.

**Part 2.** Each processor has a daily volume limit (in USD equivalent; conversion rates given as input). Assign payments greedily by value, staying under processor limits. If no processor can take a payment, mark it `UNROUTED`.

**Part 3.** Minimize total fees across all payments, subject to processor capacity constraints.

*Canonical problem: Generalized Assignment Problem (NP-hard).*
*Expected move: recognize GAP, propose greedy (sort by marginal fee saving, assign), mention LP relaxation as a lower bound.*

---

## Drill 2: Merchant Settlement Batching

**Part 1.** Given transactions `[{merchant, amount, timestamp}]`, compute each merchant's net payout at end of day.

**Part 2.** Settlement has a fixed per-batch fee of $5. Payouts must happen within 24h of the transaction. Compute total fees per merchant assuming one batch per merchant per day.

**Part 3.** Global limit: only N batches total per day across all merchants. Maximize merchants served, ties broken by total payout value.

*Canonical problem: Knapsack-style resource allocation (NP-hard).*
*Expected move: recognize bounded-resource packing, propose value-weighted greedy (serve highest-value merchants first), mention DP as exact-for-small-N.*

---

## Drill 3: Fraud Rule Coverage

**Part 1.** Given rules `[{rule_id, flagged_transactions: [ids]}]`, compute how many unique transactions are flagged across all rules.

**Part 2.** Given a target transaction ID, find all rules that flagged it.

**Part 3.** You can only enable K rules. Choose K rules to maximize unique transactions flagged.

*Canonical problem: Maximum Coverage (NP-hard).*
*Expected move: recognize Max Coverage, propose greedy (repeatedly pick rule covering most uncovered transactions), cite the (1 − 1/e) ≈ 63% approximation ratio as a bonus.*

---

## Drill 4: Subscription Notification Bundling

**Part 1.** Given subscriptions `[{user, expiration_date}]` and today's date, output all subscriptions expiring in the next 30 days, grouped by week.

**Part 2.** Add a "send notification K days before expiration" rule. Output the notification send date for each subscription.

**Part 3.** Some users have multiple subscriptions. Bundle notifications so each user gets at most one email per week covering all upcoming expirations. Minimize total emails while ensuring every expiration is notified within its K-day window.

*Canonical problem: Interval scheduling with bundling constraints (NP-hard in the general case).*
*Expected move: frame as interval problem, propose earliest-deadline-first greedy, acknowledge exact solution needs ILP.*

---

## Drill 5: Currency Conversion Chain

**Part 1.** Given a graph of exchange rates `[{from, to, rate}]`, convert amount X from A to B using a direct edge if it exists, else error.

**Part 2.** Find the lowest-cost path A → B through any number of hops.

*This part is still P: take logs of rates, run Dijkstra. Worth practicing the transform.*

**Part 3.** Given a set of required conversions `[{from, to, amount}]` and a per-pair activation cost, minimize total cost (activation + conversion) subject to activating only enough pairs to cover all required conversions.

*Canonical problem: Steiner Tree in a graph (NP-hard).*
*Expected move: recognize Steiner tree, propose greedy (iteratively add the pair that covers the most remaining required conversions per unit cost).*

---

## Drill 6: Refund Reconciliation

**Part 1.** Given charges `[{id, amount}]` and refunds `[{charge_id, amount}]`, compute net amount per charge.

**Part 2.** Some refunds are missing `charge_id`. For each orphan refund, match it to a charge with the exact same amount if one exists.

**Part 3.** Orphan refunds may correspond to *combinations* of charges (one $100 refund could match two charges of $60 + $40). Match each orphan refund to a subset of charges summing exactly to the refund amount.

*Canonical problem: Subset Sum (NP-hard, weakly).*
*Expected move: recognize subset sum, note pseudo-polynomial DP (O(n × amount)) works if amounts are bounded integers in cents, fall back to greedy for large values.*

---

## Drill 7: Bank Account Rebalancing (the original Stripe problem)

**Part 1.** Given accounts with balances, some above threshold T and some below, output a list of transfers so every account ends at ≥ T.

**Part 2.** Production-readiness: how do you verify the result? What do you do if verification fails? (Not a coding question — discussion.)

**Part 3.** Minimize the number of transfers.

*Canonical problem: Fixed-charge bipartite flow; reduces to Subset Sum / Partition (NP-hard).*
*Expected move: state NP-hardness, give lower bound (N − Z, where Z is max zero-sum subsets), propose pair-matching heuristic (bipartite matching on exact-value edges), fall back to greedy two-pointer for the rest.*

---

## Canonical NP-hard Problems to Recognize

Memorize these six patterns. Most Stripe algorithmic follow-ups map to one:

- **Subset Sum / Partition** → "match refunds to charges," "settle debts," "split evenly"
- **Knapsack** → "fit items under a cap, maximize value"
- **Maximum Coverage / Set Cover** → "pick K things to cover the most / pick fewest things to cover all"
- **Generalized Assignment** → "route items to servers with capacities, minimize cost"
- **Steiner Tree** → "activate minimum edges in a network to connect required nodes"
- **Bin Packing** → "pack items into fixed-capacity bins, use fewest bins"

For each, in interview:

1. Name the canonical problem.
2. State it's NP-hard.
3. Propose a greedy or approximation heuristic.
4. Name the approximation ratio if you know it (bonus).
5. Mention ILP/SMT as the exact approach for small inputs.

---

## The Arc to Practice

For every drill, rehearse this flow:

1. **Clarifying questions** before touching code (input format, size, edge cases, output format).
2. **Working solution first**, narrate trade-offs. "Let me get something correct, then we can optimize."
3. **Modular code from the start** — Part 2 will extend Part 1, don't paint yourself into a corner.
4. **Incremental testing** — add a test case, run, iterate. Not 60 lines then run.
5. **On the NP-hard part**: recognize → name → heuristic → bound. Don't try to solve optimally.
6. **Scope the time** if needed: "I've taken this as far as useful; want me to keep refining or move to the next part?"
