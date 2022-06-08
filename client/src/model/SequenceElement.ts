import type { Colours } from '../routes/fight/fight-sequence-components/Colours';
import type { Actions } from '../routes/fight/fight-sequence-components/Actions';
import type { Components } from '../routes/fight/fight-sequence-components/Components';

export class SequenceElement {
  nextComponent: Components;
  currentComponent: Components;
  action: Actions;
  colour: Colours;
}
