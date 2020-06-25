import React from 'react';
import {
	Button,
	Divider,
  Form,
	InputNumber
} from 'antd'

import {DeleteOutlined, ExportOutlined} from '@ant-design/icons'

export default function DataControls (props) {
  const [min, setMin] = React.useState(0)
  const [max, setMax] = React.useState(0)

  const returnRange = () => {
    props.updateRange({min: min, max: max})
  }



  return (
    <div className="data-controls">
			<div className="data-controls-menu">
			<Form layout="inline">
        <Form.Item label="Min">
          <InputNumber min={0} onChange={(v) => setMin(v)} onPressEnter={returnRange} placeholder={props.range.min} size="small" />
        </Form.Item>
        <Form.Item label="Max">
          <InputNumber min={0} onChange={(v) => setMax(v)} onPressEnter={returnRange} placeholder={props.range.max} size="small" />
        </Form.Item>
      </Form>
			<div className="data-controls-buttons">
				<Button icon={<ExportOutlined />} onClick={props.clear}></Button>
				<Button icon={<DeleteOutlined />} onClick={props.clear}></Button>
			</div>
			</div>
      <Divider />
    </div>

  );
}
