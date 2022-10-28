import { FormControl } from '@angular/forms';
import { FormlyComponents } from '@common/neuvector-formly/neuvector-formly.module';

export const ServiceModeTypes = [
  { value: 'Discover', viewValue: 'topbar.mode.LEARNING' },
  { value: 'Monitor', viewValue: 'topbar.mode.EVALUATION' },
  { value: 'Protect', viewValue: 'topbar.mode.ENFORCE' },
];

export const ScannerAutoscaleStrategy = [
  {
    value: 'immediate',
    viewValue: 'setting.autoscale.strategy.IMMEDIATE',
  },
  { value: 'delayed', viewValue: 'setting.autoscale.strategy.DELAYED' },
  { value: '', viewValue: 'setting.DISABLED' },
];

export const ScannerAutoscaleHideExpr =
  'model.scanner_autoscale.strategy === "n/a"';

export const ServiceModeField = {
  key: 'new_service_policy_mode',
  wrappers: [FormlyComponents.HINT_WRAPPER],
  type: FormlyComponents.RADIO,
  templateOptions: {
    items: ServiceModeTypes,
    hintPosition: 'after',
    hint: 'setting.NEW_SERVICE_COMMENT',
    hintClass: 'ml-4 text-muted',
    fieldClass: 'col-md-4',
  },
};

export const ProfileBaselineBoolField = {
  formControl: new FormControl(),
  wrappers: [FormlyComponents.HINT_WRAPPER],
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    label: 'enum.ZERODRIFT',
    labelPosition: 'before',
    hintPosition: 'after',
    hint: 'setting.ZERODRIFT_COMMENT',
    hintClass: 'ml-4 text-muted',
    fieldClass: 'col-md-4',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.formControl;
      ctrl.setValue(
        field.model['new_service_profile_baseline'] === 'zero-drift'
      );
      ctrl.valueChanges.subscribe((x: boolean) => {
        const formCtrl = field.parent.formControl.get(
          'new_service_profile_baseline'
        );
        formCtrl.setValue(x ? 'zero-drift' : 'basic');
        formCtrl.markAsDirty();
      });
    },
  },
};

export const ProfileBaselineField = {
  key: 'new_service_profile_baseline',
};

export const NetworkServiceStatusField = {
  key: 'net_service_status',
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    ariaLabelledBy: 'setting.NET_SERVICE_POLICY_MODE',
  },
};

export const NetworkServiceModeField = {
  key: 'net_service_policy_mode',
  type: FormlyComponents.RADIO,
  wrappers: [FormlyComponents.HINT_WRAPPER],
  templateOptions: {
    items: ServiceModeTypes,
    hintPosition: 'after',
    hintClass: 'ml-4 text-muted',
    fieldClass: 'col-md-4',
  },
  expressionProperties: {
    'templateOptions.hint': model =>
      model.net_service_status
        ? 'setting.description.ENABLED_NET_POLICY_MODE'
        : 'setting.description.DISABLED_NET_POLICY_MODE',
  },
};

export const ScannerAutoscaleField = {
  key: 'scanner_autoscale.strategy',
  type: FormlyComponents.RADIO,
  wrappers: [FormlyComponents.HINT_WRAPPER],
  templateOptions: {
    items: ScannerAutoscaleStrategy,
    fieldClass: 'col-md-4',
  },
};

export const ScannerAutoscaleMinField = {
  key: 'scanner_autoscale.min_pods',
};

export const ScannerAutoscaleMaxField = {
  key: 'scanner_autoscale.max_pods',
};

export const ScannerAutoscaleMinMaxField = {
  formControl: new FormControl([]),
  type: FormlyComponents.NGX_SLIDER,
  templateOptions: {
    min: 0,
    max: 128,
    step: 1,
    showTicks: true,
    tickStep: 10,
    className: 'nv-range-slider',
    label: 'setting.autoscale.MIN_MAX',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.formControl;
      const formCtrl = field.parent.formControl.get('scanner_autoscale');
      ctrl.setValue([
        formCtrl.get('min_pods').value,
        formCtrl.get('max_pods').value,
      ]);
      ctrl.valueChanges.subscribe(([min, max]) => {
        formCtrl.get('min_pods').setValue(min);
        formCtrl.get('max_pods').setValue(max);
        formCtrl.markAsDirty();
      });
    },
  },
};

export const D2MToggleField = {
  key: 'mode_auto_d2m',
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    label: 'setting.D2M',
    labelPosition: 'before',
    fixed: 'md',
    tooltip: 'setting.D2M_HINT',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('mode_auto_d2m_duration');
      ctrl.valueChanges.subscribe(duration => {
        if (!duration) {
          field.formControl.setValue(false);
        }
      });
    },
  },
};

export const D2MDurationField = {
  key: 'mode_auto_d2m_duration',
  type: FormlyComponents.NGX_SLIDER,
  templateOptions: {
    min: 0,
    max: 720,
    step: 1,
    showTicks: true,
    ticksArray: [0, 1, 2, 3, 4, 5, 10, 15, 20, 30].map(x => x * 24),
    className: 'nv-range-slider',
    label: 'setting.D2M',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('mode_auto_d2m');
      field.templateOptions.disabled = !ctrl.value;
      ctrl.valueChanges.subscribe(isEnabled => {
        if (isEnabled && !field.formControl.value) {
          field.formControl.setValue(1);
        }
        field.templateOptions.onChangeDisabled(!isEnabled);
      });
    },
  },
  expressionProperties: {
    'templateOptions.formatter': 'formState.slider_formatter',
  },
};

export const M2PToggleField = {
  key: 'mode_auto_m2p',
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    label: 'setting.M2P',
    labelPosition: 'before',
    fixed: 'md',
    tooltip: 'setting.M2P_HINT',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('mode_auto_m2p_duration');
      ctrl.valueChanges.subscribe(duration => {
        if (!duration) {
          field.formControl.setValue(false);
        }
      });
    },
  },
};

export const M2PDurationField = {
  key: 'mode_auto_m2p_duration',
  type: FormlyComponents.NGX_SLIDER,
  templateOptions: {
    min: 0,
    max: 720,
    step: 1,
    showTicks: true,
    ticksArray: [0, 1, 2, 3, 4, 5, 10, 15, 20, 30].map(x => x * 24),
    className: 'nv-range-slider',
    label: 'setting.M2P',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('mode_auto_m2p');
      field.templateOptions.disabled = !ctrl.value;
      ctrl.valueChanges.subscribe(isEnabled => {
        if (isEnabled && !field.formControl.value) {
          field.formControl.setValue(1);
        }
        field.templateOptions.onChangeDisabled(!isEnabled);
      });
    },
  },
  expressionProperties: {
    'templateOptions.formatter': 'formState.slider_formatter',
  },
};

export const ClusterNameField = {
  key: 'cluster_name',
  type: FormlyComponents.ICON_INPUT,
  templateOptions: {
    label: 'setting.CLUSTER_NAME',
    maxLength: 1000,
  },
};

export const DurationToggleField = {
  key: 'duration_toggle',
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    label: 'audit.gridHeader.DURATION',
    labelPosition: 'before',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('unused_group_aging');
      ctrl.valueChanges.subscribe(duration => {
        if (!duration) {
          field.formControl.setValue(false);
        }
      });
    },
  },
};

export const DurationSliderField = {
  key: 'unused_group_aging',
  type: FormlyComponents.NGX_SLIDER,
  templateOptions: {
    min: 0,
    max: 168,
    step: 1,
    showTicks: true,
    tickStep: 24,
    className: 'nv-range-slider',
    label: 'audit.gridHeader.DURATION',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.parent.formControl.get('duration_toggle');
      field.templateOptions.disabled = !field.formControl.value;
      ctrl.valueChanges.subscribe(isEnabled => {
        field.templateOptions.onChangeDisabled(!isEnabled);
      });
    },
  },
  expressionProperties: {
    'templateOptions.formatter': 'formState.slider_formatter',
  },
};

export const XFFToggleField = {
  key: 'xff_enabled',
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    ariaLabelledBy: 'setting.XFF_MATCH',
  },
};

export const TelemetryToggleBoolField = {
  formControl: new FormControl(),
  type: FormlyComponents.TOGGLE,
  templateOptions: {
    ariaLabelledBy: 'setting.TELEMETRY',
  },
  hooks: {
    onInit: field => {
      const ctrl = field.formControl;
      ctrl.setValue(!field.model['no_telemetry_report']);
      ctrl.valueChanges.subscribe((x: boolean) => {
        const formCtrl = field.parent.formControl.get('no_telemetry_report');
        formCtrl.setValue(!x);
        formCtrl.markAsDirty();
      });
    },
  },
};

export const TelemetryToggleField = {
  key: 'no_telemetry_report',
};