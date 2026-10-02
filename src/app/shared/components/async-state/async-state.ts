import { ResourceStatus } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';
import { IconName } from '../icon/icon';
import { Skeleton } from '../skeleton/skeleton';

/**
 * The shared loading / error / empty / content pattern for anything fed by a `resource`.
 * Pass the resource's `status()`; the projected content shows only when data is ready and
 * not empty. Parents should give their resources a `defaultValue` so projected bindings
 * never see `undefined` while a state other than content is shown.
 */
@Component({
  selector: 'app-async-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton, ErrorState, EmptyState],
  template: `
    @switch (view()) {
      @case ('loading') {
        <app-skeleton [variant]="skeleton()" [count]="skeletonCount()" />
      }
      @case ('error') {
        <app-error-state (retry)="retry.emit()" />
      }
      @case ('empty') {
        <app-empty-state [icon]="emptyIcon()" [title]="emptyTitle()" [message]="emptyMessage()">
          <ng-content select="[empty]" />
        </app-empty-state>
      }
      @default {
        <ng-content />
      }
    }
  `,
})
export class AsyncState {
  readonly status = input.required<ResourceStatus>();
  /** `true` when the loaded data has nothing to show (also after filtering). */
  readonly empty = input(false);
  readonly skeleton = input<'text' | 'card' | 'list'>('card');
  readonly skeletonCount = input(3);
  readonly emptyTitle = input<string>();
  readonly emptyMessage = input<string>();
  readonly emptyIcon = input<IconName>('inbox');
  readonly retry = output<void>();

  protected readonly view = computed(() => {
    const status = this.status();
    if (status === 'loading' || status === 'idle') return 'loading';
    if (status === 'error') return 'error';
    return this.empty() ? 'empty' : 'content';
  });
}
