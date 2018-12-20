import { View } from '../../core/view.js'
import { List } from '../../util/list-util.js'
import { app ,senjsCts} from '../../core/app-context.js'
import { Thread } from '../../core/thread.js';
import { BaseLayout } from './base-layout.js';
import { senjs } from '../../index.js';

export class FrameLayout extends BaseLayout {
  
    constructor(width,height) {
        super(width,height);      
        this.setPosition(senjs.constant.Position.RELATIVE);
    }
}