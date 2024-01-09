"use client";

import { useState } from "react";
import {
  Box,
  Center,
  Flex,
  Heading,
  LinkBox,
  Button,
  Divider,
  Stack,
  Text,
  IconButton,
  Input,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useToast,
  Select,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  SelectAggregation,
  selectAggregationValues,
} from "@/lib/types/SelectAggregation";
import {
  ExecuteQueryRequest,
  SelectField,
} from "@/lib/types/ExecuteQueryRequest";
import {
  ExecuteQueryErrorResponse,
  ExecuteQueryResponse,
} from "@/lib/types/ExecuteQueryResponse";
import { WhereOperation } from "@/lib/types/WhereClause";
import { RootWhereOperation } from "./components/WhereOperation";

export default function Home() {
  const [selectFields, setSelectFields] = useState<SelectField[]>([]);
  const [tableName, setTableName] = useState<string>("");
  const toast = useToast();

  const [responseData, setResponseData] = useState<ExecuteQueryResponse | null>(
    null
  );

  const [whereOperation, setWhereOperation] = useState<WhereOperation | null>(
    null
  );

  return (
    <Flex flexDirection="column" w="100%" p="10">
      <Box w="100%">
        <Heading p="4">SQL Builder</Heading>
      </Box>

      <LinkBox p="5" borderWidth="1px" w="auto" rounded="md">
        <Box>Query</Box>
        <Stack direction="row" h="100%" maxH="100%" p={4}>
          <Divider orientation="vertical" h="auto" borderWidth="2px" />

          <Stack direction="column">
            <Text>SELECT</Text>

            {selectFields.map((value, index) => (
              <Flex key={index}>
                <Center>
                  <Select
                    mr="2"
                    w="fit-content"
                    value={value.type}
                    onChange={(e) => {
                      const type = e.currentTarget.value as SelectAggregation;
                      const newFields = selectFields.map((valueU, indexU) => {
                        if (indexU === index) {
                          return { ...valueU, type: type };
                        } else {
                          return valueU;
                        }
                      });
                      setSelectFields(newFields);
                    }}
                  >
                    {selectAggregationValues.map((value, index) => (
                      <option key={index} value={value}>
                        {value === "none" ? "value" : value.toLocaleUpperCase()}
                      </option>
                    ))}
                  </Select>

                  <Input
                    w="fit-content"
                    value={value.value}
                    placeholder="Enter the column name"
                    onChange={(e) => {
                      const newValue = e.currentTarget.value;
                      const newFields = selectFields.map((valueU, indexU) => {
                        if (indexU === index) {
                          return { ...valueU, value: newValue };
                        } else {
                          return valueU;
                        }
                      });
                      setSelectFields(newFields);
                    }}
                  />

                  {selectFields.length > 1 && (
                    <IconButton
                      ml="2"
                      variant="outline"
                      aria-label="delete select"
                      size="sm"
                      w="fit-content"
                      icon={<MinusIcon />}
                      onClick={() => {
                        setSelectFields(
                          selectFields.filter(
                            (itemU, indexU) => indexU !== index
                          )
                        );
                      }}
                    />
                  )}
                </Center>
              </Flex>
            ))}

            <IconButton
              variant="outline"
              aria-label="add select"
              size="sm"
              w="fit-content"
              icon={<AddIcon />}
              onClick={() => {
                setSelectFields([...selectFields, { value: "", type: "none" }]);
              }}
            />

            <Text>FROM</Text>

            <Input
              value={tableName}
              placeholder="Enter the table name"
              onChange={(e) => {
                setTableName(e.currentTarget.value);
              }}
            />

            <Text>WHERE</Text>

            <RootWhereOperation
              operation={whereOperation}
              onUpdate={setWhereOperation}
            />
          </Stack>
        </Stack>

        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => {
            const data: ExecuteQueryRequest = {
              tableName: tableName,
              selectFields: selectFields,
              whereClause: whereOperation,
            };
            (async () => {
              const response = await fetch("/api/executeQuery", {
                method: "POST",
                body: JSON.stringify(data),
              });
              const json = await response.json();
              if (response.status === 400) {
                const errorJson = json as ExecuteQueryErrorResponse;
                toast({
                  title: errorJson.errorMessage,
                  status: "error",
                  isClosable: true,
                });
              } else {
                const successJson = json as ExecuteQueryResponse;
                setResponseData(successJson);
              }
            })();
          }}
        >
          Send Query
        </Button>
      </LinkBox>

      {responseData !== null && responseData.data.length >= 1 ? (
        <TableContainer w="fit-content">
          <Table size="sm">
            <Thead>
              <Tr>
                {Object.keys(responseData.data[0]).map((item, index) => (
                  <Th key={index}>{(item as any).toString()}</Th>
                ))}
              </Tr>
            </Thead>

            <Tbody>
              {responseData.data.map((row, index) => (
                <Tr key={index}>
                  {Object.values(row).map((item, index) => (
                    <Td key={index}>
                      {item ? (item as any).toString() : "NULL"}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : responseData !== null ? (
        <Text>Empty table</Text>
      ) : (
        <></>
      )}
    </Flex>
  );
}
