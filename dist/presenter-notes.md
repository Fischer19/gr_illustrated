# Generative retrieval — five-minute presenter notes

**Audience:** Engineers new to recommendation systems.  
**Delivery:** 647 spoken words. Aim for about 135 words per minute, with short pauses for the animations. Products, codes, probabilities, and paths are teaching examples, not outputs from a trained model. Read the paragraphs aloud; stage directions and source links are not part of the script.

**0:00–0:30 · Set up the problem**  
*Select Present in the header, then start on 01 Semantic IDs. Use the catalog items to set the context before replaying the animation.*

“Imagine someone has just interacted with a few items in our large catalog. We need a useful shortlist for what to show next. That selection step is called retrieval. A separate ranking stage can decide the final order.

Today we’ll compare three ways to get from someone’s history to catalog items.

The same user activity is the starting point for all three.”

**0:30–1:35 · Give an item a semantic ID**  
*Stay on 01 Semantic IDs. Run the item-to-code animation. Point to the Trail runner code and the related lightweight trail shoe.*

“An ordinary database ID identifies an item, but its digits tell the model nothing about it.

A semantic ID is a short sequence of learned codes. Item descriptions become vectors: lists of numbers representing their content. A learned compression model turns those vectors into discrete tokens.

The first token captures a broad approximation. Later tokens refine what remains. Related items can share the beginning of their codes, so the model can share information across them. Here, two trail shoes share 12 and 07. Sharing a prefix is useful evidence of similarity, with no guarantee.

Think of an address that becomes more specific as you read it. These codes are learned patterns; they don’t reliably translate to human category labels.

Our tiny catalog has unique three-token codes. Larger systems may append a distinguishing token when codes collide.”

*Technical basis: [Semantic IDs and residual quantization](https://arxiv.org/html/2306.08121v2), with collision handling in [TIGER, section 3.1](https://arxiv.org/html/2305.05065v2).*

**1:35–3:20 · Generate several candidates with beam search**  
*Open 02 Generate with Beam search selected (beam width 3). Replay the animation. Point to the surviving prefixes after each token, then the three resolved items. Briefly switch to One path to show the single-path walkthrough, conceptually equivalent to beam width 1.*

“Now replace the history’s items with their semantic IDs. A Transformer reads that history. Its decoder predicts the next item’s address, token by token, using both the history and the output so far. That is autoregressive prediction.

Training examples pair a history with the actual next item, teaching the model to assign its ID higher probability.

To retrieve several candidates, we use beam search. A beam is a small set of unfinished addresses. At each step, extend every surviving address, score the extensions, and keep the best few across all branches.

With a width of three, we retain up to three paths. Initially, only two valid first tokens exist. After the second token, three prefixes survive. The final expansion produces four complete IDs; we keep the three highest-scoring ones.

Scores accumulate along each path. For the trail runner, 0.80 times 0.70 times 0.55 gives 0.308. These are illustrative probabilities over valid continuations. Implementations usually add log probabilities instead of multiplying tiny numbers. Both preserve the same ordering for these equal-length IDs.

This demo only permits prefixes that lead to catalog items. The surviving IDs resolve to two trail shoes and a hiking boot.

Width one keeps only a single path and returns one item here. Wider beams explore more alternatives and cost more computation. Beam search can still miss the best complete sequence because discarded branches never return.

We generate addresses for existing products.”

*Technical basis: [TIGER, sections 3.2 and E](https://arxiv.org/html/2305.05065v2), [GENRE’s catalog-constrained generation](https://github.com/facebookresearch/GENRE), and [Hugging Face’s beam-search implementation](https://github.com/huggingface/transformers/blob/main/src/transformers/generation/utils.py).*

*Presenter reference, not spoken: This demo constrains every prefix to the four valid catalog IDs. TIGER’s original experiments allow invalid IDs; its appendix discusses larger beams plus filtering. The toy scores multiply conditional probabilities over allowed continuations: 12 → 07 → 42 scores 0.308; 12 → 07 → 43 scores 0.252; 12 → 19 → 08 scores 0.240; 31 → 05 → 11 scores 0.200. Width 3 keeps the first three. Width 1 is greedy decoding and has the same winning item in this example; the illustration demonstrates candidate breadth, not an improvement in top-result accuracy.*

**3:20–4:30 · Compare the three retrieval paths**  
*Open 03 Compare. Run the animations together. Point to the co-purchase graph, the vector space, then the generated tokens.*

“On the left, item-to-item retrieval follows behavioral connections. People who interacted with one item also interacted with another. We precompute related-item lists from signals such as views or purchases, then combine evidence from the person’s history. The links express observed relatedness; the items need not look alike.

In the middle, embedding retrieval turns the person’s context into a query vector. Items have vectors too. An approximate nearest-neighbor index, or ANN, searches for high-similarity vectors without checking every catalog item. Our flat picture illustrates a space that usually has many dimensions.

On the right, generative retrieval predicts ID sequences and looks up the resulting items.

The retrieval operations are: follow item links, search vector space, or generate addresses.

These approaches can use overlapping signals. ANN systems can also use Transformers and ordered histories. Generative retrieval still learns from behavior. The distinction is how candidates are selected.”

*Technical basis: [Amazon’s item-to-item collaborative filtering paper](https://www.cs.umd.edu/~samir/498/Amazon-Recommendations.pdf) and [Google Research’s explanation of vector similarity search](https://research.google/blog/announcing-scann-efficient-vector-similarity-search/).*

**4:30–5:00 · Close on the engineering decision**  
*Keep all three paths visible. Let the animation finish; it will hold on the final state.*

“Each approach creates different engineering work. Item links need updating. Vector retrieval needs an index. Generative retrieval needs a useful code system, a trained sequence model, and valid catalog lookup.

None automatically wins on quality, speed, or freshness. We measure those against our data and constraints, and can combine approaches.

Remember: semantic IDs turn items into token sequences; a Transformer predicts the next sequence; beam search keeps several possibilities alive.”
