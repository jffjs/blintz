pub type Value = f64;

pub struct ValueArray {
    pub values: Vec<Value>
}

impl ValueArray {
    pub fn new() -> ValueArray {
        ValueArray { values: vec![] }
    }

    pub fn len(&self) -> usize {
        self.values.len()
    }

    pub fn write_value(&mut self, value: Value) {
        self.values.push(value);
    }
}
