export default interface IMyResponse<T> {
  isSuccess?: boolean;
  message?: string;
  data?: T;
}
