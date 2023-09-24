import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  declare username: string;

  @Column
  declare email: string;

  @Column
  declare firstName?: string;

  @Column
  declare lastName?: string;

  @Column
  declare avatar?: string;

  @Column({ defaultValue: false })
  declare isRoot: boolean;
}
