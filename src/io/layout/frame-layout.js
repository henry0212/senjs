import { View } from '../../core/view.js'
import { List } from '../../util/list-util.js'
import { app ,dhCts} from '../../core/app-context.js'
import { Thread } from '../../core/thread.js';
import { BaseLayout } from './base-layout.js';
import { dh } from '../../index.js';

export class FrameLayout extends BaseLayout {
  
    constructor(width,height) {
        super();      
        this.setWidth(width).setHeight(height);
        this.setPosition(dh.constant.Position.RELATIVE);
    }
}