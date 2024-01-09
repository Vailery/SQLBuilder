import {
  ComplexOpeartion,
  ComplexOpeartion as ComplexOperation,
  WhereOperation,
  SimpleOperation,
} from "@/lib/types/WhereClause";
import {
  CombiningWhereOperation,
  ComparisonOperation,
  combiningWhereOperations,
  comparisonOperations,
} from "@/lib/types/WhereOperations";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
  Divider,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
} from "@chakra-ui/react";

const emptyComplexOperation: ComplexOpeartion = {
  type: "complex",
  operator: "and",
  operations: [],
};

const emptySimpleOperation: SimpleOperation = {
  type: "simple",
  operator: "=",
  value1: "",
  value2: "",
};

export const RootWhereOperation = ({
  operation,
  onUpdate,
}: {
  operation: WhereOperation | null;
  onUpdate: (operations: WhereOperation | null) => void;
}) => {
  return operation ? (
    <Flex>
      {operation.type === "simple" ? (
        <SimpleOperationComp operation={operation} onUpdate={onUpdate} />
      ) : (
        <ComplexOperationComp operation={operation} onUpdate={onUpdate} />
      )}

      <Center>
        <IconButton
          ml="2"
          mb="1"
          variant="outline"
          aria-label="delete select"
          size="sm"
          w="fit-content"
          icon={<MinusIcon />}
          onClick={() => {
            onUpdate(null);
          }}
        />
      </Center>
    </Flex>
  ) : (
    <WhereMenu
      onGroupClicked={() => onUpdate(emptyComplexOperation)}
      onRuleClicked={() => onUpdate(emptySimpleOperation)}
    />
  );
};

const WhereOperation = ({
  operation,
  onUpdate,
}: {
  operation: WhereOperation;
  onUpdate: (operations: WhereOperation) => void;
}) => {
  return (
    <>
      {operation.type === "simple" ? (
        <SimpleOperationComp operation={operation} onUpdate={onUpdate} />
      ) : (
        <ComplexOperationComp operation={operation} onUpdate={onUpdate} />
      )}
    </>
  );
};

const SimpleOperationComp = ({
  operation,
  onUpdate,
}: {
  operation: SimpleOperation;
  onUpdate: (operation: SimpleOperation) => void;
}) => {
  return (
    <Flex my="2">
      <Input
        placeholder="First value"
        value={operation.value1}
        onChange={(e) =>
          onUpdate({ ...operation, value1: e.currentTarget.value })
        }
      />

      <Select
        mx="2"
        w="180px"
        value={operation.operator}
        onChange={(e) => {
          const op = e.currentTarget.value as ComparisonOperation;
          onUpdate({ ...operation, operator: op });
        }}
      >
        {comparisonOperations.map((value, index) => (
          <option key={index} value={value}>
            {value}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Second value"
        value={operation.value2}
        onChange={(e) =>
          onUpdate({ ...operation, value2: e.currentTarget.value })
        }
      />
    </Flex>
  );
};

const ComplexOperationComp = ({
  operation,
  onUpdate,
}: {
  operation: ComplexOperation;
  onUpdate: (operation: ComplexOperation) => void;
}) => {
  return (
    <Flex>
      <Divider orientation="vertical" h="auto" borderWidth="2px" mr="2" />

      <Box>
        <Flex>
          <Select
            mr="2"
            mb="2"
            mt="2"
            value={operation.operator}
            onChange={(e) => {
              const op = e.currentTarget.value as CombiningWhereOperation;
              onUpdate({ ...operation, operator: op });
            }}
          >
            {combiningWhereOperations.map((value, index) => (
              <option key={index} value={value}>
                {value.toLocaleUpperCase()}
              </option>
            ))}
          </Select>

          <WhereMenu
            onRuleClicked={() => {
              onUpdate({
                ...operation,
                operations: [...operation.operations, emptySimpleOperation],
              });
            }}
            onGroupClicked={() =>
              onUpdate({
                ...operation,
                operations: [...operation.operations, emptyComplexOperation],
              })
            }
          />
        </Flex>

        {operation.operations.map((op, index) => (
          <Flex key={index}>
            <WhereOperation
              operation={op}
              onUpdate={(newOp: WhereOperation) => {
                const newOperations = operation.operations.map(
                  (opU, indexU) => {
                    if (indexU === index) {
                      return newOp;
                    } else {
                      return opU;
                    }
                  }
                );
                onUpdate({ ...operation, operations: newOperations });
              }}
            />

            <Center>
              <IconButton
                ml="2"
                mb="1"
                variant="outline"
                aria-label="delete select"
                size="sm"
                w="fit-content"
                icon={<MinusIcon />}
                onClick={() => {
                  onUpdate({
                    ...operation,
                    operations: operation.operations.filter(
                      (opU, indexU) => indexU !== index
                    ),
                  });
                }}
              />
            </Center>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};

const WhereMenu = ({
  onRuleClicked,
  onGroupClicked,
}: {
  onRuleClicked: () => void;
  onGroupClicked: () => void;
}) => {
  return (
    <Box pb="4">
      <Menu>
        <MenuButton
          mt="3"
          as={IconButton}
          aria-label="Options"
          icon={<AddIcon />}
          variant="outline"
          w="fit-content"
          size="sm"
        />

        <MenuList>
          <MenuItem icon={<span>A</span>} onClick={onRuleClicked}>
            Rule
          </MenuItem>

          <MenuItem icon={<span>B</span>} onClick={onGroupClicked}>
            Group
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};
