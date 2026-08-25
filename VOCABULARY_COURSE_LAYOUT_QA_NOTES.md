# Vocabulary and Course Layout QA Notes

## Local runtime checks

- Parts of Speech Mastery route loaded successfully at `courses/parts-of-speech-mastery/lesson/pos-foundation/slide/1`.
- The table slide rendered as a three-column table with `Noun`, `Pronoun`, `Adjective`, `Verb`, `Adverb`, `Preposition`, `Conjunction`, and `Interjection` intact; no arbitrary mid-word break appeared in the mobile viewport.
- The course table remained readable with the updated responsive table styling.
- Vocabulary category A loaded five sandbox QA records.
- Each card displayed only the sound button and the `•••` overflow control in its top action area.
- The overflow menu exposed Temporary Flash Test, Copy AI image prompt, and Add/Replace memory image actions.
- A synthetic 16:9 image was attached to sandbox record `qa-abandon`; it was converted to an offline JPEG data URL, saved to IndexedDB by the explicit upload action, and rendered immediately in the card thumbnail.
- After attachment, the menu changed to Replace memory image and Remove image.

The sandbox records are isolated from the user's production GitHub Pages origin and were used only for non-destructive QA.

The Copy AI image prompt action was exposed in the overflow menu and remained on the vocabulary route. After the thumbnail was attached, the same menu correctly exposed Replace and Remove image actions while the image remained visible in the card.

The updated Vocabulary card menu exposed the Flash action. A browser coordinate click did not navigate, which was confirmed as an interaction-targeting artifact because the same public action invoked directly changed the hash to `vocabulary-master/flash/qa-abandon`. The Flash page then rendered `Question 1 of 20`, card context, four options, Exit, Skip, and the explicit `no history saved` notice without errors.
