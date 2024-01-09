"use client";
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

export default function Home() {
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

            <Input placeholder="Enter the columns names" />

            <Text>FROM</Text>

            <Input placeholder="Enter the table name" />
            <Box>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<AddIcon />}
                  variant="outline"
                  w="fit-content"
                  size="sm"
                />
                <MenuList>
                  <MenuItem icon={<span>&</span>}>AND</MenuItem>
                  <MenuItem icon={<span>|</span>}>OR</MenuItem>
                </MenuList>
              </Menu>
              <Badge ml={3}>Optional</Badge>
            </Box>
          </Stack>
        </Stack>

        <Button colorScheme="teal" variant="outline" isDisabled={true}>
          Send Query
        </Button>
      </LinkBox>
    </Flex>
  );
}
