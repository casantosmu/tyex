import { Type } from "@sinclair/typebox";
import tyex, { TypeOpenAPI } from "../../../src";
import { ErrorDTO } from "../common/error";
import { UserDTO } from "./user.dtos";

const users: UserDTO[] = [
  {
    id: 1,
    username: "admin_user",
    role: "admin",
    deletedAt: null,
  },
];

const userController = {
  getAll: tyex.handler(
    {
      tags: ["users"],
      parameters: [
        {
          in: "query",
          name: "limit",
          required: false,
          schema: TypeOpenAPI.Options(Type.Integer(), {
            default: 10,
          }),
        },
      ],
      responses: {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: Type.Array(UserDTO),
            },
          },
        },
      },
    },
    (req, res) => {
      res.json(users.slice(0, req.query.limit));
    },
  ),
  post: tyex.handler(
    {
      tags: ["users"],
      summary: "Create a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: Type.Omit(UserDTO, ["id", "role", "deletedAt"]),
          },
        },
      },
      responses: {
        "201": {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: UserDTO,
            },
          },
        },
        "400": {
          description: "Invalid input",
          content: {
            "application/json": {
              schema: ErrorDTO,
            },
          },
        },
      },
    },
    (req, res) => {
      const user: UserDTO = {
        id: users.length + 1,
        role: "user",
        deletedAt: null,
        ...req.body,
      };

      users.push(user);
      res.status(201).json(user);
    },
  ),
  delete: tyex.handler(
    {
      tags: ["users"],
      summary: "Delete a user",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: Type.Integer(),
        },
      ],
      responses: {
        "204": {
          description: "User deleted successfully",
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: ErrorDTO,
            },
          },
        },
        "404": {
          description: "User not found",
          content: {
            "application/json": {
              schema: ErrorDTO,
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    (req, res) => {
      const isAdmin = req.user?.isAdmin;

      if (!isAdmin) {
        const error = "You don't have permission to perform this action";
        res.status(401).json({ error });
        return;
      }

      const user = users.find((user) => user.id === req.params.id);
      if (!user) {
        const error = "User not found";
        res.status(404).json({ error });
        return;
      }

      user.deletedAt = new Date().toISOString();
      res.sendStatus(204);
    },
  ),
};

export default userController;
