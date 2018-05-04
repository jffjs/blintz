#[derive(Debug, Primitive)]
pub enum OpCode {
    OpConstant = 0,
    OpConstantLong = 1,
    OpAdd = 2,
    OpSubtract = 3,
    OpMultiply = 4,
    OpDivide = 5,
    OpNegate = 6,
    OpReturn = 99,
}
