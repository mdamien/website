import React from 'react';
import Select from 'react-select';
import map from 'lodash/map';
import cls from 'classnames';

import enums from '../../../../specs/enums.json';

const OPTIONS = {};

for (const k in enums) {
  const e = enums[k];

  if (e.groups) {
    OPTIONS[k] = map(e.groups, ({en, values}) => {
      return {
        label: en,
        options: values.map(value => {
          return {
            value,
            label: e.fr[value]
          };
        })
      };
    });
  }
  else {
    OPTIONS[k] = map(e.fr, (label, key) => ({
      value: key,
      label
    }));
  }
}

export default React.memo(function EnumSelector(props) {
  const {
    value,
    enumType,
    onChange
  } = props;

  const options = OPTIONS[enumType];

  let selected;

  const onChangeCallback = React.useCallback(option => onChange(option.value), []);

  if (enums[enumType].groups) {
    selected = options.flatMap(g => g.options).find(o => o.value === value);
  }
  else {
    selected = options.find(o => o.value === value);
  }

  if (options.length < 4)
    return (
      <span className="buttons has-addons">
        {options.map(o => {
          return (
            <span
              key={o.value}
              className={cls('button', o === selected && ['is-info', 'is-selected'])}
              onClick={() => onChange(o.value)}>
              {o.label}
            </span>
          );
        })}
      </span>
    );
  return (
    <Select
      value={selected}
      onChange={onChangeCallback}
      options={options} />
  );
});
