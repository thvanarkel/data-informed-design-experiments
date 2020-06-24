import React from 'react';
import {
	Divider,
  Form,
	InputNumber
} from 'antd'

export default function DataControls (props) {
  const [min, setMin] = React.useState(0)
  const [max, setMax] = React.useState(0)

  const returnRange = () => {
    props.updateRange({min: min, max: max})
  }

  return (
    <div>
      <Form layout="inline">
        <Form.Item label="Min">
          <InputNumber min={0} onChange={(v) => setMin(v)} onPressEnter={returnRange} placeholder={props.range.min} size="small" />
        </Form.Item>
        <Form.Item label="Max">
          <InputNumber min={0} onChange={(v) => setMax(v)} onPressEnter={returnRange} placeholder={props.range.max} size="small" />
        </Form.Item>
      </Form>
      <Divider />
    </div>
  );
}
